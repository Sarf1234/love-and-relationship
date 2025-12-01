import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import { createSlug } from "@/utils/createSlug";
import { calculateReadTime } from "@/utils/readTime";
import sanitizeHtml from "sanitize-html";
import { requireAdmin } from "@/lib/protectRoute";
import { deleteImage } from "@/lib/cloudinary"; // if you store public_id

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return new Response(JSON.stringify({ success: false, message: "Invalid id" }), { status: 400 });

    const post = await Post.findById(id).populate("categories").populate("tags");
    if (!post) return new Response(JSON.stringify({ success: false, message: "Post not found" }), { status: 404 });

    return new Response(JSON.stringify({ success: true, data: post }), { status: 200 });
  } catch (err) {
    console.error("GET /api/posts/:id error", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return new Response(JSON.stringify({ success: false, message: "Invalid id" }), { status: 400 });

    const body = await req.json();

    const post = await Post.findById(id);
    if (!post) return new Response(JSON.stringify({ success: false, message: "Post not found" }), { status: 404 });

    // Basic size check
    if (body.content && body.content.length > 300000) {
      return new Response(JSON.stringify({ success: false, message: "Content too large" }), { status: 400 });
    }

    // Sanitize content if provided
    if (body.content) {
      body.content = sanitizeHtml(body.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ "img", "h1", "h2", "span" ]),
        allowedAttributes: {
          a: ["href", "name", "target"],
          img: ["src", "alt", "width", "height"],
          "*": ["class", "style"] // allow class & style for all tags
        },
      });
    }

    // Validate categories/tags same as create
    if (body.categories) {
      if (!Array.isArray(body.categories) || !body.categories.length) {
        return new Response(JSON.stringify({ success: false, message: "At least one category required" }), { status: 400 });
      }
      if (body.categories.some(id => !/^[0-9a-fA-F]{24}$/.test(id))) {
        return new Response(JSON.stringify({ success: false, message: "Invalid category id format" }), { status: 400 });
      }
      const foundCategories = await Category.find({ _id: { $in: body.categories } });
      if (foundCategories.length !== body.categories.length) {
        return new Response(JSON.stringify({ success: false, message: "One or more categories not found" }), { status: 400 });
      }
    }

    if (body.tags) {
      if (!Array.isArray(body.tags)) {
        return new Response(JSON.stringify({ success: false, message: "Tags must be array" }), { status: 400 });
      }
      if (body.tags.some(id => !/^[0-9a-fA-F]{24}$/.test(id))) {
        return new Response(JSON.stringify({ success: false, message: "Invalid tag id format" }), { status: 400 });
      }
      const foundTags = await Tag.find({ _id: { $in: body.tags } });
      if (foundTags.length !== body.tags.length) {
        return new Response(JSON.stringify({ success: false, message: "One or more tags not found" }), { status: 400 });
      }
    }

    // Slug handling
    if (body.title && body.title !== post.title) {
      let newSlug = createSlug(body.slug || body.title);
      const existing = await Post.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existing) newSlug = `${newSlug}-${Date.now()}`;
      post.slug = newSlug;
    }

    // Cover image: if changed and we stored previous public_id, delete it
    if (body.coverImage && post.coverImage && body.coverImage !== post.coverImage) {
      // If you store public_id separately, delete by public_id
      // Example: if post.coverImagePublicId exists
      if (post.coverImagePublicId) {
        try { await deleteImage(post.coverImagePublicId); } catch (e) { console.warn("Failed to delete old cover image", e); }
      }
      post.coverImage = body.coverImage;
    }

    // Published flag handling
    if (typeof body.published !== "undefined") {
      const newPublished = !!body.published;
      if (newPublished && !post.published) {
        post.publishedAt = new Date();
      } else if (!newPublished) {
        post.publishedAt = null;
      }
      post.published = newPublished;
    }

    // Content/readTime
    if (body.content && body.content !== post.content) {
      post.readTime = calculateReadTime(body.content);
      post.content = body.content;
    }

    // Update other fields safely
    const fields = ["excerpt","metaTitle","metaDescription","metaKeywords","isFeatured","isTrending","title"];
    fields.forEach(f => {
      if (typeof body[f] !== "undefined") post[f] = body[f];
    });

    if (Array.isArray(body.categories)) post.categories = body.categories;
    if (Array.isArray(body.tags)) post.tags = body.tags;

    await post.save();

    const updated = await Post.findById(post._id).populate("categories").populate("tags");
    return new Response(JSON.stringify({ success: true, data: updated, message: "Post updated" }), { status: 200 });
  } catch (err) {
    console.error("PUT /api/posts/:id error", err);
    if (err.code === 11000) {
      return new Response(JSON.stringify({ success: false, message: "Duplicate key error" }), { status: 409 });
    }
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) return new Response(JSON.stringify({ success: false, message: "Invalid id" }), { status: 400 });

    const post = await Post.findByIdAndDelete(id);
    if (!post) return new Response(JSON.stringify({ success: false, message: "Post not found" }), { status: 404 });

    // optionally delete cover image
    if (post.coverImagePublicId) {
      try { await deleteImage(post.coverImagePublicId); } catch (e) { console.warn("Failed to delete post image", e); }
    }

    return new Response(JSON.stringify({ success: true, message: "Post deleted" }), { status: 200 });
  } catch (err) {
    console.error("DELETE /api/posts/:id error", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Tag from "@/models/Tag";
import { createSlug } from "@/utils/createSlug";
import { calculateReadTime } from "@/utils/readTime";
import sanitizeHtml from "sanitize-html";
import { requireAdmin } from "@/lib/protectRoute";
import { NextResponse } from "next/server";


/*
  GET: query params:
    - page, limit (pagination)
    - category (slug) -> filter by category id
    - tags (comma slug list) -> filter by tag ids
    - q (search query)
    - featured=true
*/

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const categorySlug = searchParams.get("category");
    const tagsSlugs = searchParams.get("tags"); // comma separated list
    const q = searchParams.get("q");
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");

    let filter = { published: true };

    // --------------------------------------------
    // CATEGORY FILTER (ALWAYS ARRAY)
    // --------------------------------------------
    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug }).lean();

      if (!cat) {
        return NextResponse.json({ success: true, data: [], total: 0 });
      }

      filter.categories = { $in: [cat._id] }; // FIXED
    }

    // --------------------------------------------
    // TAGS FILTER (ALWAYS ARRAY)
    // --------------------------------------------
    if (tagsSlugs) {
      const slugs = tagsSlugs.split(",").filter(Boolean);

      const tagDocs = await Tag.find({ slug: { $in: slugs } }).lean();

      filter.tags = { $in: tagDocs.map(t => t._id) }; // FIXED
    }

    // --------------------------------------------
    // FEATURED FILTER
    // --------------------------------------------
    if (featured === "true") filter.isFeatured = true;

    // --------------------------------------------
    // TRENDING FILTER
    // --------------------------------------------
    if (trending === "true") filter.isTrending = true;

    // --------------------------------------------
    // SEARCH FILTER
    // --------------------------------------------
    let query = Post.find(filter);

    if (q) {
      query = Post.find({
        $text: { $search: q },
        ...filter,
      });
    }

    // --------------------------------------------
    // SORT ORDER
    // --------------------------------------------
    query = query.sort({
      isFeatured: -1,
      isTrending: -1,
      createdAt: -1,
    });

    // --------------------------------------------
    // PAGINATION
    // --------------------------------------------
    const skip = (page - 1) * limit;

    const total = await query.clone().countDocuments();

    const posts = await query
      .skip(skip)
      .limit(limit)
      .populate("categories", "name slug title")
      .populate("tags", "name slug title")
      .lean();

    return NextResponse.json({ success: true, data: posts, total });
  } catch (err) {
    console.error("GET /api/posts ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}




/*
  POST: Create a post
  Body JSON expected:
  {
    title, content, excerpt, coverImage, categories: [id], tags:[id], isFeatured, isTrending, published, metaTitle, metaDescription, metaKeywords:[]
  }
  Only admin allowed -> requireAdmin()
*/
export async function POST(req) {
  try {
    await connectDB();

    // permission
    await requireAdmin(); // throws if not admin

    const body = await req.json();

    // Basic size limits
    if (!body.title || !body.content) {
      return new Response(JSON.stringify({ success: false, message: "Title and content required" }), { status: 400 });
    }
    if (body.content.length > 300000) { // ~300k chars
      return new Response(JSON.stringify({ success: false, message: "Content too large" }), { status: 400 });
    }

    // Sanitize content to prevent XSS (we still store HTML but sanitized)
    const cleanContent = sanitizeHtml(body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([ "img", "h1", "h2", "span" ]),
        allowedAttributes: {
          a: ["href", "name", "target"],
          img: ["src", "alt", "width", "height"],
          "*": ["class", "style"] // allow class & style for all tags
        },
    });

    // Validate categories array
    const categories = Array.isArray(body.categories) ? body.categories : [];
    if (!categories.length) {
      return new Response(JSON.stringify({ success: false, message: "At least one category required" }), { status: 400 });
    }
    // Validate each id
    const invalidCategory = categories.some(id => !id || !/^[0-9a-fA-F]{24}$/.test(id));
    if (invalidCategory) {
      return new Response(JSON.stringify({ success: false, message: "Invalid category id format" }), { status: 400 });
    }
    const foundCategories = await Category.find({ _id: { $in: categories } });
    if (foundCategories.length !== categories.length) {
      return new Response(JSON.stringify({ success: false, message: "One or more categories not found" }), { status: 400 });
    }

    // Validate tags if provided
    const tags = Array.isArray(body.tags) ? body.tags : [];
    if (tags.length) {
      const invalidTag = tags.some(id => !id || !/^[0-9a-fA-F]{24}$/.test(id));
      if (invalidTag) {
        return new Response(JSON.stringify({ success: false, message: "Invalid tag id format" }), { status: 400 });
      }
      const foundTags = await Tag.find({ _id: { $in: tags } });
      if (foundTags.length !== tags.length) {
        return new Response(JSON.stringify({ success: false, message: "One or more tags not found" }), { status: 400 });
      }
    }

    // Slug generation + uniqueness check
    let slug = body.slug ? createSlug(body.slug) : createSlug(body.title);
    // try to ensure uniqueness
    const exists = await Post.findOne({ slug });
    if (exists) slug = `${slug}-${Date.now()}`;

    // read time
    const readTime = calculateReadTime(cleanContent);

    // publishedAt handling
    const published = body.published === undefined ? true : !!body.published;
    const publishedAt = published ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null;

    // Create post
    const postDoc = await Post.create({
      title: body.title,
      slug,
      content: cleanContent,
      excerpt: body.excerpt || (cleanContent.replace(/<[^>]+>/g, "").slice(0, 160)),
      coverImage: body.coverImage || "",
      categories,
      tags,
      isFeatured: !!body.isFeatured,
      isTrending: !!body.isTrending,
      published,
      publishedAt,
      readTime,
      metaTitle: body.metaTitle || body.title,
      metaDescription: body.metaDescription || (body.excerpt || ""),
      metaKeywords: Array.isArray(body.metaKeywords) ? body.metaKeywords : [],
    });

    // populate for response
    const created = await Post.findById(postDoc._id).populate("categories").populate("tags");

    return new Response(JSON.stringify({ success: true, data: created, message: "Post created" }), { status: 201 });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    // duplicate key
    if (err.code === 11000) {
      return new Response(JSON.stringify({ success: false, message: "Duplicate slug or unique field" }), { status: 409 });
    }
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

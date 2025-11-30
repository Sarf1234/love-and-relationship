import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const category = await Category.findOne({ slug });
    if (!category) return new Response(JSON.stringify({ success: false, message: "Category not found" }), { status: 404 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);
    const skip = (page - 1) * limit;

    const filter = { published: true, categories: category._id };

    const posts = await Post.find(filter)
      .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("categories")
      .populate("tags")
      .lean();

    const total = await Post.countDocuments(filter);

    return new Response(JSON.stringify({ success: true, data: posts, total, category }), { status: 200 });
  } catch (err) {
    console.error("GET /api/posts/category/[slug] error:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}

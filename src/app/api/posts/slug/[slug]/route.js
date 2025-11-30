import { connectDB } from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { slug } = await params;
    if (!slug)
      return new Response(
        JSON.stringify({ success: false, message: "Slug is required" }),
        { status: 400 }
      );

    const post = await Post.findOne({ slug })
      .populate("categories")
      .populate("tags");

    if (!post)
      return new Response(
        JSON.stringify({ success: false, message: "Post not found" }),
        { status: 404 }
      );

    return new Response(
      JSON.stringify({ success: true, data: post }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/posts/slug/:slug error", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500 }
    );
  }
}

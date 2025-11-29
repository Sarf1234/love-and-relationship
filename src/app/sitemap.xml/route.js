// app/sitemap/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import Tag from "@/models/Tag";

export async function GET() {
  try {
    await connectDB(); // Connect to MongoDB

    const [posts, categories, tags] = await Promise.all([
      Post.find({}, "slug").lean(),
      Category.find({}, "slug").lean(),
      Tag.find({}, "slug").lean(),
    ]);

    const baseUrl = "https://love-and-relationship.vercel.app"; // Replace with your production URL

    // Static pages
    const urls = [
      `${baseUrl}/`,
      `${baseUrl}/login`,
      `${baseUrl}/sign-up`,
      `${baseUrl}/blog`,
    ];

    // Add dynamic routes
    posts.forEach((p) => urls.push(`${baseUrl}/blog/${p.slug}`));
    categories.forEach((c) => urls.push(`${baseUrl}/category/${c.slug}`));
    tags.forEach((t) => urls.push(`${baseUrl}/tag/${t.slug}`));

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
      .map(
        (url) => `
  <url>
    <loc>${url}</loc>
  </url>`
      )
      .join("")}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (err) {
    console.error("Failed to generate sitemap", err);
    return NextResponse.json({ error: "Failed to generate sitemap" }, { status: 500 });
  }
}

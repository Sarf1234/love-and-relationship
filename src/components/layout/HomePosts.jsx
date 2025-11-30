export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";
import { apiRequest } from "@/lib/api";

export default async function HomePosts() {
  let posts = [];

  try {
    const res = await apiRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts?page=1&limit=6`
    );
    posts = res.data || [];
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    return null;
  }

  if (!posts.length) return null;

  return (
    <section className="bg-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
          Latest & Featured Stories
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post, index) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group block overflow-hidden rounded-2xl shadow-sm border border-rose-100 hover:shadow-xl hover:border-rose-300 transition-all duration-300 bg-white"
              prefetch={false} // ❗ Prevents extra work on mobile
            >
              {/* Image */}
              <div className="relative w-full h-48 sm:h-56 md:h-64">
                <Image
                  src={post.coverImage || "/placeholder.png"}
                  alt={post.title}
                  fill
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading={index < 2 ? "eager" : "lazy"} // 🟢 Only first 2 posts load eagerly for LCP
                />
              </div>

              <div className="p-4 sm:p-5">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories?.map((cat) => (
                    <span
                      key={cat._id}
                      className="text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-700 font-medium"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-rose-500 transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mt-2 text-sm sm:text-base line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>{post.readTime || 3} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

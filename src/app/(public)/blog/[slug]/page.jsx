import Image from "next/image";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  let post = null;

  try {
    const res = await apiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/slug/${slug}`);
    post = res.data;
  } catch (error) {
    console.error("Failed to fetch post for metadata:", error);
  }

  if (!post) return { title: "Post Not Found", description: "This post does not exist." };

  const metaTitle = post.metaTitle || post.title;
  const metaDescription =
    post.metaDescription ||
    post.excerpt ||
    post.categories?.[0]?.description ||
    "Read this informative post about love, relationships, and personal stories.";

  const metaKeywords =
    post.metaKeywords?.join(", ") ||
    post.tags?.map((t) => t.name).join(", ") ||
    post.categories?.map((c) => c.name).join(", ");

  const canonicalUrl = `https://truefeelings.in/blog/${post.slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: post.coverImage || "/placeholder.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [post.coverImage || "/placeholder.png"],
    },
  };
}

export default async function SinglePostPage({ params }) {
  const { slug } = await params;

  let post = null;

  try {
    const res = await apiRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/slug/${slug}`);
    post = res.data;
  } catch (error) {
    console.error("Failed to fetch post:", error);
  }

  if (!post) {
    return (
      <div className="max-w-6xl mx-auto py-32 text-center">
        <h1 className="text-3xl font-bold text-gray-700">Post not found</h1>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-purple-50 pb-20">

      {/* HEADER BANNER */}
      <section className="relative w-full h-[55vh] rounded-b-3xl overflow-hidden shadow-xl">
        <Image
          src={post.coverImage || "/placeholder.png"}
          alt={post.title}
          fill
          priority
          className="object-cover object-center brightness-[0.8]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight drop-shadow-2xl">
            {post.title}
          </h1>
          <p className="text-rose-100 mt-3 text-sm">
            {new Date(post.createdAt).toLocaleDateString()} • {post.readTime || 3} min read
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 -mt-12">
        <div className="bg-white border border-rose-100 shadow-2xl rounded-3xl p-8 sm:p-12">

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6 pt-8">
            {post.categories?.map((cat) => (
              <span
                key={cat._id}
                className="px-3 py-1 text-xs rounded-full bg-rose-100 text-rose-700 font-medium"
              >
                {cat.name}
              </span>
            ))}
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-gray-700 italic border-l-4 border-rose-300 pl-5 mb-10">
              {post.excerpt}
            </p>
          )}

          {/* Main content */}
          <div
            className="
              prose prose-lg max-w-none
              prose-p:text-gray-800
              prose-li:text-gray-800
              prose-headings:text-gray-900
              prose-a:text-rose-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md
            "
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Related Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag._id}
                    href={`/tag/${tag.slug}`}
                    className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-block px-7 py-3 rounded-lg bg-gradient-to-r 
              from-rose-500 to-fuchsia-600 text-white font-semibold shadow-lg 
              hover:shadow-xl active:scale-95 transition-all"
          >
            ← Back to Blogs
          </Link>
        </div>
      </div>
    </article>
  );
}

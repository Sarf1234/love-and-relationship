import Link from "next/link";
import { apiRequest } from "@/lib/api";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function CategoriesSection() {
  let categories = [];

  try {
    const res = await apiRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
    );
    categories = res.data || [];
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }

  if (!categories.length) return null;

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16"
      aria-labelledby="categories-heading"
    >
      <h2
        id="categories-heading"
        className="text-3xl font-extrabold text-gray-900 mb-10 text-center"
      >
        Explore Categories
      </h2>

      <div className="grid gap-4 
        grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-4 
        lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            prefetch={false}
            className="block rounded-xl px-4 py-3 
              bg-rose-50 text-rose-700 font-medium text-center 
              shadow-sm 
              hover:bg-rose-100 
              hover:-translate-y-1 
              hover:shadow-md 
              transition-all duration-200 
              will-change-transform"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

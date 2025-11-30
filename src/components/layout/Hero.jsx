import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-rose-100 via-pink-50 to-purple-50 overflow-hidden">

      {/* Soft Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#ffe4e6,_#f3d1ff)] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 flex flex-col md:flex-row items-center md:justify-between gap-12">

        {/* LEFT CONTENT */}
        <div className="md:w-1/2 text-center md:text-left">

          {/* MAIN TITLE (Keyword Optimized) */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Find Clarity in Love,{" "}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
              Heal Your Heart
            </span>{" "}
            & Build Better Relationships
          </h1>

          {/* SUBTEXT (High-Intent Keywords) */}
          <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
            Get expert-backed <strong>relationship advice</strong>, 
            practical <strong>dating tips</strong>, 
            proven <strong>breakup healing guides</strong>, 
            and emotional support designed to help you grow, heal, and love fearlessly again.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <Link
              href="/blog"
              className="px-7 py-3 bg-rose-500 text-white rounded-lg shadow-lg font-semibold hover:bg-rose-600 transition-all duration-200 text-center"
            >
              Explore Relationship Blogs
            </Link>

            <Link
              href="/tag/breakup"
              className="px-7 py-3 border border-rose-500 text-rose-600 rounded-lg font-semibold hover:bg-rose-50 transition-all duration-200 text-center"
            >
              Start Healing → 
            </Link>
          </div>

          {/* TRUST INDICATORS */}
          <div className="mt-8 text-gray-600 text-sm sm:text-base">
            ❤️ Trusted by thousands seeking{" "}
            <span className="font-semibold text-rose-600">love clarity</span>  
            &{" "}
            <span className="font-semibold text-rose-600">emotional healing</span>
          </div>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <Image
            src="https://res.cloudinary.com/dsc5aznps/image/upload/v1764423345/posts/b4h68sz4bxoy5g9tcecl.png"
            alt="Love, relationship and emotional healing illustration"
            width={580}
            height={580}
            priority
            className="animate-float drop-shadow-xl select-none"
          />
        </div>

      </div>
    </section>
  );
}

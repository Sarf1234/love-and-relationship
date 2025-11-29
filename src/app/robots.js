// /app/robots.ts
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/login", "/sign-up"],
      },
    ],
    sitemap: "https://love-and-relationship.vercel.app/sitemap.xml",
  };
}

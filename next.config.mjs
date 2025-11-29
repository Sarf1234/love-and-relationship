/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  experimental: {
    forceSwcTransforms: true,
    optimizePackageImports: [],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dsc5aznps/image/upload/**",
      },
    ],
  },
};

export default nextConfig;

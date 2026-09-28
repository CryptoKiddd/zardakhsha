import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  sassOptions: {
    // Lets every *.module.scss do `@use "abstracts" as *;`
    loadPaths: [path.join(process.cwd(), "src/styles")],
  },
  images: {
    remotePatterns: [
      // Product photos will live on a CDN (Cloudinary / R2). Add the host here.
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
    ],
  },
};

export default nextConfig;

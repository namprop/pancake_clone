import type { NextConfig } from "next";

const backendApiUrl = (
  process.env.BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["antd"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${backendApiUrl}/api/:path*`,
        },
        {
          source: "/uploads/:path*",
          destination: `${backendApiUrl}/uploads/:path*`,
        },
      ],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

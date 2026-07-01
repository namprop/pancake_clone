import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["antd"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/auth/:path*",
          destination: `${backendApiUrl}/api/auth/:path*`,
        },
        {
          source: "/api/customers/:path*",
          destination: `${backendApiUrl}/api/customers/:path*`,
        },
        {
          source: "/api/facebook/:path*",
          destination: `${backendApiUrl}/api/facebook/:path*`,
        },
        {
          source: "/api/settings/:path*",
          destination: `${backendApiUrl}/api/settings/:path*`,
        },
        {
          source: "/api/webhook/:path*",
          destination: `${backendApiUrl}/api/webhook/:path*`,
        },
        {
          source: "/api/uploads",
          destination: `${backendApiUrl}/api/uploads`,
        },
        {
          source: "/api/quick_replies",
          destination: `${backendApiUrl}/api/quick_replies`,
        },
        {
          source: "/api/quick_reply_topics",
          destination: `${backendApiUrl}/api/quick_reply_topics`,
        },
        {
          source: "/api/image_folders",
          destination: `${backendApiUrl}/api/image_folders`,
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

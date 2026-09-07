import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/storage.magicpath.ai/**",
      },
    ],
  },
};

export default nextConfig;

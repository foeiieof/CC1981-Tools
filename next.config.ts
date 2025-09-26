import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // appDir: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cf.shopee.co.th",
        pathname: "/**"
      }
    ]
  },
  allowedDevOrigins: ['http://localhost:3000', '10.128.111.53'],
};

export default nextConfig;

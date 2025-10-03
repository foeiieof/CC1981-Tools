import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  // appDir: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cf.shopee.co.th",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "*.ibyteimg.com",
        pathname: "/**"
      }

    ]
  },
  allowedDevOrigins: ['10.128.111.156'],
};
// p19-oec-sg.ibyteimg.com
export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
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
  // experimental: { serverComponentsExternalPackages: ['pino', 'pino-pretty'] },
  serverExternalPackages: ['pino', 'pino-pretty']
};
// p19-oec-sg.ibyteimg.com
export default nextConfig;

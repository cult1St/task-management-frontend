import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "themesbrand.com",
        pathname: "/chatvia-tailwind/layouts/assets/images/**",
      },
    ],
  },
};

export default nextConfig;

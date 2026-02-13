import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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

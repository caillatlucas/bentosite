import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // If deploying to a subfolder on GitHub Pages, uncomment the line below and replace 'repo-name'
  // basePath: '/repo-name',
};

export default nextConfig;

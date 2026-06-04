/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/bentosite",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: '/bentosite',
  trailingSlash: true,
};
  basePath: '/bentosite',
  output: 'export', // si vous utilisez l'export statique
};

export default nextConfig;

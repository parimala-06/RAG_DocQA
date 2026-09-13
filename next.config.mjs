/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfjs-dist resolves its worker script via require.resolve() at runtime;
  // webpack bundling rewrites that into an internal module id instead of a
  // real path, so keep the package external and let Node resolve it natively.
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist"],
  },
};

export default nextConfig;

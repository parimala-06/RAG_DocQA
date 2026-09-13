/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdfjs-dist resolves its worker script via require.resolve() at runtime;
  // webpack bundling rewrites that into an internal module id instead of a
  // real path, so keep the package external and let Node resolve it natively.
  experimental: {
    serverComponentsExternalPackages: ["pdfjs-dist"],
    // pdfjs-dist loads its worker via a runtime-computed dynamic import, which
    // Next's output file tracing can't detect statically — without this, the
    // worker file is silently left out of the deployed serverless function
    // bundle (confirmed on Vercel: "Cannot find module
    // '.../pdfjs-dist/legacy/build/pdf.worker.mjs'" at runtime).
    outputFileTracingIncludes: {
      "/api/upload": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
    },
  },
};

export default nextConfig;

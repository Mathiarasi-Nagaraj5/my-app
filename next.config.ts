/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      // add your real image host here (e.g. Cloudinary, S3, Shopify CDN)
    ],
  },
   serverExternalPackages: ["pdfkit"],
};

module.exports = nextConfig;
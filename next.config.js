/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "@prisma/client"],

  // 🔥 ADDED THIS BLOCK TO FIX VERCEL TURBOPACK ERROR
  experimental: {
    turbopack: {},
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "canvas",
        "jsdom",
      ];
    }
    return config;
  },

  images: {
    domains: [],
  },
};

module.exports = nextConfig;
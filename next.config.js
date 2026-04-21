/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "@prisma/client", "bcryptjs"],
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
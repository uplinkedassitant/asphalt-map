/** @type {import('next').NextConfig} */
const nextConfig = {
  // Leaflet needs this for marker icon assets
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

module.exports = nextConfig;

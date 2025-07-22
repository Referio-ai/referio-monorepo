/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  images: {
    domains: ['localhost', '127.0.0.1','cfokmfebovujgcgequmn.supabase.co'],
  },
};

module.exports = nextConfig;

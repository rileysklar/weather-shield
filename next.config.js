/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      path: false,
      crypto: false,
    };
    return config;
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'weather-shield.vercel.app'],
    },
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig 

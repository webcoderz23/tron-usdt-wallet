/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure environment variables that should be accessible on the client
  env: {
    // Add any client-side env vars here
  }
}

module.exports = nextConfig 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enables a minimal Node.js server bundle for Docker/self-hosted deployments.
  output: "standalone",
};

export default nextConfig;

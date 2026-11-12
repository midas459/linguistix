/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the Cloudflare/vinext build unchanged; enable standalone only in Docker.
  ...(process.env.SELF_HOSTED_BUILD === "1" ? { output: "standalone" } : {}),
};

export default nextConfig;

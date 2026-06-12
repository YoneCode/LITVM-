/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Export to plain static files (out/) — the app is fully client-side
  // (Privy + ethers in the browser, no server code), so it hosts on
  // Cloudflare Pages exactly like a static site.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

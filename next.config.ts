import { hostname, networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// A phone opens the dev server through this Mac's network address (http://192.168.x.x:4000).
// In development Next only accepts localhost unless other hosts are listed, and without that
// connection the page never hydrates: no intro, no slingshot, nothing interactive.
// The addresses are looked up when the server starts, so this works on any network (home,
// school, hotspot) without hard-coding one. It only applies to `next dev`.
const ownHosts = [
  hostname(),
  ...Object.values(networkInterfaces())
    .flat()
    .filter((net) => net !== undefined && net.family === "IPv4" && !net.internal)
    .map((net) => net!.address),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ownHosts,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

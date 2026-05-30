import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.lsasuperliga.es" }],
        destination: "https://lsasuperliga.es/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

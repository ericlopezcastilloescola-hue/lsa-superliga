import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-libsql",
    "@libsql/client",
    "@vercel/blob",
  ],
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

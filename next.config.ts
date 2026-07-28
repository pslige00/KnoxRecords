import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Largest allowed upload is a 25MB request document (see
      // RECORD_DOC_MAX_BYTES); leave headroom for multipart overhead.
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;

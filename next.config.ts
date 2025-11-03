import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Configuração para o módulo canvas
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }

    // Configuração para PDFs
    config.resolve.alias.canvas = false;

    return config;
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Adiciona suporte para o módulo canvas no servidor
    if (isServer) {
      config.externals.push({
        canvas: 'commonjs canvas',
      });
    }

    // Configura o PDF.js worker
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/legacy/build/pdf';

    return config;
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;

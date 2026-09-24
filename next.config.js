const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Aligné sur la limite produit de 5 Mo/fichier (upload.ts + dropzone) :
      // 6 mb laisse la marge pour la sérialisation du FormData autour du fichier.
      bodySizeLimit: '6mb',
    },
  },
  outputFileTracingRoot: require('path').join(__dirname),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
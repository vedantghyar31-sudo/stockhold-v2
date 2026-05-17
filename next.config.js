/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Firebase Auth avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Firebase Storage (fallback)
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      // Any other CDN — catches legacy URLs
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
    
  },
  experimental: {
    optimizeCss: false, // disables LightningCSS
  },
  images: {
    unoptimized: true,
  },
  // Ensure API routes are included in build
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Consolidated experimental options
  experimental: {
    optimizeCss: false, // disables LightningCSS
    serverComponentsExternalPackages: ['@prisma/client'],
    instrumentationHook: true,
  },
}

export default nextConfig

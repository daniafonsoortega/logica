import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // generateBuildId força rebuild limpo ao mudar
  generateBuildId: async () => 'build-' + (process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? Date.now().toString()),
}

export default nextConfig

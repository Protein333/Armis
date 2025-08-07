import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Electronビルド時のみ静的エクスポートを使用
  output: process.env.NEXT_PUBLIC_ELECTRON === 'true' ? 'export' : undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  // 静的エクスポート時にAPIルートを除外
  distDir: process.env.NEXT_PUBLIC_ELECTRON === 'true' ? 'out' : '.next',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      }
    }

    // Monaco Editorの設定
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    })

    return config
  },
  serverExternalPackages: ['ollama'],
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['firebase'],
  webpack: (config, options) => {
    const projectRoot = '/data/.openclaw/workspace/mission-control'
    config.resolve.alias['@'] = projectRoot
    console.log('Webpack alias @ set to:', projectRoot)
    return config
  }
}

module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'origin-east-01-drupal-fishwatch.woc.noaa.gov',
        port: '',
      },
    ],
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // For static export
  images: {
    unoptimized: true, // Allow unoptimized images for static export
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.module.rules.push({
        test: /\.js$/,
        // Exclude the .next directory to prevent processing Next.js internals
        exclude: /\.next/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['next/babel']],
          },
        },
      });
    }
    return config;
  },
};

module.exports = nextConfig;

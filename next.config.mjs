/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['antd', 'rc-util', 'rc-pagination', 'rc-picker', '@ant-design/icons-svg', 'rc-input'],
};

export default nextConfig;

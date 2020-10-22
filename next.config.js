const withBundleAnalyzer = require('@next/bundle-analyzer');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = bundleAnalyzer({
  async redirects() {
    return [
      {
        source: '/',
        destination: '/rounds',
        permanent: false,
      },
    ];
  },
});

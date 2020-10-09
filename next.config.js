const withSass = require('@zeit/next-sass');

module.exports = withSass({
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

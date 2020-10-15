module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/rounds',
        permanent: false,
      },
    ];
  },
};

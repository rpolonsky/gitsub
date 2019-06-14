const proxy = require('http-proxy-middleware');

const ghUrl = process.env.GH_URL || 'https://api.github.com';

module.exports = function(app) {
  app.use(
    proxy('/api/gh', {
      target: ghUrl,
      changeOrigin: true,
      pathRewrite: { '^/api/gh': '' },
    }),
  );
};

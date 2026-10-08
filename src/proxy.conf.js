module.exports = {
  '/api': {
    target: 'https://localhost:7183',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    logLevel: 'debug',
  },
};
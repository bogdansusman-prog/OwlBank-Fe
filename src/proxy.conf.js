module.exports = [
  // specific auth routes first
  {
    context: ['/api/login', '/api/register'],
    target: 'https://localhost:62684',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
  // everything else under /api
  {
    context: ['/api'],
    target: 'https://localhost:7183',
    pathRewrite: { '^/api': '' },
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
];
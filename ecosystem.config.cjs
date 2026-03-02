/**
 * PM2 ecosystem – chạy trên server: pm2 start ecosystem.config.cjs
 * Yêu cầu: đã tạo api/.env; đã build web và cms (cd web && npm run build; cd cms && npm run build)
 * Trên Windows: dùng đường dẫn tuyệt đối để tránh PM2 gọi nhầm npm.cmd
 */
const path = require('path');
const root = __dirname;

module.exports = {
  apps: [
    {
      name: 'nntm-api',
      cwd: path.join(root, 'api'),
      script: path.join(root, 'api', 'src', 'server.js'),
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'nntm-cms',
      cwd: path.join(root, 'cms'),
      script: path.join(root, 'cms', 'node_modules', 'vite', 'bin', 'vite.js'),
      args: ['preview', '--port', '4202', '--host', '0.0.0.0'],
      interpreter: 'node',
      autorestart: true,
      watch: false,
    },
    {
      name: 'nntm-web',
      cwd: path.join(root, 'web'),
      script: path.join(root, 'web', 'node_modules', 'vite', 'bin', 'vite.js'),
      args: ['preview', '--port', '4203', '--host', '0.0.0.0'],
      interpreter: 'node',
      autorestart: true,
      watch: false,
    },
  ],
};

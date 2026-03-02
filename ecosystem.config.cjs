/**
 * PM2 ecosystem – chạy trên server: pm2 start ecosystem.config.cjs
 * Yêu cầu: đã tạo api/.env; đã build web và cms (cd web && npm run build; cd cms && npm run build)
 */
module.exports = {
  apps: [
    {
      name: 'nntm-api',
      cwd: './api',
      script: 'src/server.js',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
    // CMS (chạy sau khi đã build: cd cms && npm run build)
    {
      name: 'nntm-cms',
      cwd: './cms',
      script: 'npm',
      args: ['run', 'start:prod'],
      interpreter: 'node',
      autorestart: true,
      watch: false,
    },
    // Web (chạy sau khi đã build: cd web && npm run build)
    {
      name: 'nntm-web',
      cwd: './web',
      script: 'npm',
      args: ['run', 'start:prod'],
      interpreter: 'node',
      autorestart: true,
      watch: false,
    },
  ],
};

/**
 * PM2 ecosystem file for production on VPS.
 * Usage: pm2 start ecosystem.config.cjs
 * Ensure .env.production exists on the server with all required variables.
 */
module.exports = {
  apps: [
    {
      name: 'gregtutors',
      cwd: __dirname,
      script: 'node_modules/.bin/next',
      args: 'start -p 4200',
      env: { NODE_ENV: 'production' },
      // Next.js loads .env.production when NODE_ENV=production; create that file on the server.
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};

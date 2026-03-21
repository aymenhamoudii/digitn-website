module.exports = {
  apps: [
    {
      name: 'digitn-web',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/digitn',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/digitn/web-error.log',
      out_file: '/var/log/digitn/web-out.log',
    },
  ],
}
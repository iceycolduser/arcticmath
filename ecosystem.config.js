module.exports = {
  apps: [
    {
      name: 'server',
      script: 'index.js',
      cwd: '/root/arcticmath',
      instances: 'max',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
        // Add any other env vars here
      }
    },
    {
      name: 'caddy',
      script: '/usr/bin/caddy',
      exec_mode: 'fork'
    }
  ]
};

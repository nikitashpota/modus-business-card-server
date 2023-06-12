export const apps = [{
  name: 'my-app',
  script: 'app.js',
  instances: 'max',
  autorestart: true,
  watch: true,
  max_memory_restart: '1G',
  env: {
    NODE_ENV: 'production'
  }
}];
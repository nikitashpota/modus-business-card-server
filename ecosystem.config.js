module.exports = {
  apps: [
    {
      name: "express-app",
      script: "./app.js",
      env: {
        COMMON_VARIABLE: "true"
      }
    }
  ]
}
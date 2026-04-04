module.exports = {
  apps: [
    {
      name: "luxury-finishing",
      script: "./scripts/serve-dist.mjs",
      cwd: __dirname,
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: "3007",
      },
    },
  ],
};

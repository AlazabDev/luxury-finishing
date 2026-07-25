const instances = Number.parseInt(process.env.PM2_INSTANCES || "2", 10);
const port = process.env.PORT || "3007";
const host = process.env.HOST || "127.0.0.1";

if (!Number.isInteger(instances) || instances < 1 || instances > 8) {
  throw new Error("PM2_INSTANCES must be an integer between 1 and 8.");
}

module.exports = {
  apps: [
    {
      name: process.env.APP_NAME || "luxury-finishing",
      script: "./scripts/serve-dist.mjs",
      cwd: __dirname,
      interpreter: "node",
      instances,
      exec_mode: instances > 1 ? "cluster" : "fork",
      autorestart: true,
      watch: false,
      kill_timeout: 10_000,
      listen_timeout: 10_000,
      max_memory_restart: "384M",
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 2_000,
      time: true,
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        HOST: host,
        PORT: port,
      },
    },
  ],
};

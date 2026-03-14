module.exports = {
  apps: [
    {
      name: "cinta-dhuafa-web",
      cwd: "/var/www/cinta-dhuafa-web/current",
      script: "script/start.cjs",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "768M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};

'use strict';

// pm2 конфиг для logs-server.js.

module.exports = {
  apps: [{
    name: 'ta-web-server',
    script: './index.js',
    instances: 1,
    cwd: __dirname,
    watch: true,
    node_args: '--max_old_space_size=4096',
    exec_interpreter: 'node',
    exec_mode: 'fork',
    autorestart: true,
    max_restarts: 3,
    env: {},
  }],
};

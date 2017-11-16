'use strict';

// pm2 конфиг для logs-server.js.

module.exports = {
  apps: [{
    name: 'ta-logs-server',
    script: './ta-logs-server.js',
    instances: 1,
    cwd: __dirname,
    watch: false,
    node_args: '--max_old_space_size=4096',
    exec_interpreter: 'node',
    exec_mode: 'fork',
    autorestart: false,
    env: {},
  }],
};

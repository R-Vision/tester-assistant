'use strict';

// This config file is used by default.
// You can specify yours config file by DEP_CFG env var, and overload some of these config options.

const path = require('path');

module.exports = {
  branch: 'master',
  prjRoot: path.resolve(__dirname, '../..'), // TODO: change it when dz-deploy will be in a separated repo.

  remoteRepoCheckInterval: 180, // Seconds. Time interval between check for updates in remote repo.
};

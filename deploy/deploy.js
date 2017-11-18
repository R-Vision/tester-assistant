'use strict';


const gitUtils = require('./git-utils.js');
const { log, cfg } = require('./common.js');

// require('winston').level = 'silly';

log.info(`chdir: ${cfg.prjRoot}`);
process.chdir(cfg.prjRoot);

try {
  const res = gitUtils.pull({ pathPrefixes: ['deploy/cfg', 'deploy/common', 'deploy/dummy'] });
  console.log(res);
} catch (err) {
  log.error(err);
}

// git rev-parse 3.3-test
// git ls-remote origin -h refs/heads/3.3-test
// ? git remote update

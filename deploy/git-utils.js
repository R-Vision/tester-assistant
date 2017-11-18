'use strict';

const cp = require('child_process');
const { log, cfg } = require('./common.js');

/**
 * Wrapper for child_process.execSync.
 * Remember that execSync throws error and writes to parent stdout by default.
 * @param command
 * @return {*}
 * @throws
 */
function exec(command) {
  log.info(command);
  return cp.execSync(command);
}

/**
 * Call git pull and gets the changed files list.
 * @param {Object} args
 * @param {Array<String>} [args.pathPrefixes] - Path prefixes.
 * If some path prefix exists in changed files list
 * then returned object.prefix will be true, othwerwise - false.
 * You can use this for furter build and deploy optimization.
 * Say, if your project contains from subprojects.
 *
 * @returns {Object} { changedFiles: [], pathPrefix1: <bool>, pathPrefix2: <bool>}
 * changedFiles - array of changed files in remote repository.
 * pathPrefix1, pathPrefix2, etc. - Boolean indicators that pathPrefixes are found.
 *
 * *
 * @throws
 */
exports.pull = function pull(args = {}) {
  log.silly('pull, args: ', args);

  let out = exec(`git fetch -q origin ${cfg.branch}`);
  log.silly(`out from git fetch: ${out}`);

  const result = {};

  const prefixes = args.pathPrefixes.slice();
  prefixes.forEach((prefix) => {
    result[prefix] = false;
  });

  out = cp.execSync(`git diff --name-only origin/${cfg.branch}`).toString();
  log.silly(`out from git dif: \n${out}`);

  // TODO: check what will be in out and changedFiles if there is no changes.

  result.changedFiles = out.split(/[\r\n]+/);
  if (typeof args.pathPrefixes === 'undefined') {
    log.info('No pathPrefixes passed.');
  } else if (!Array.isArray(args.pathPrefixes)) {
    throw new Error('pathPrefixes is not array.');
  } else {
    result.changedFiles.forEach((file) => {
      for (let i = 0; i < prefixes.length; i++) { // eslint-disable-line no-plusplus
        if (file.startsWith(prefixes[i])) {
          result[prefixes[i]] = true;
          prefixes.splice(i, 1);
          break;
        }
      }
    });
  }

  if (args.dryRun) {
    log.info('No real git fetch, because dry run is requested.');
  } else {
    out = exec('git merge FETCH_HEAD');
  }

  return result;
};

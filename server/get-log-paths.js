'use strict';

// const jsStringify = require('javascript-stringify');

/**
 * Считывает пути к лог файлам для процессов, зарегистрированных в pm2.
 * Выводит пути, как конфиг файл для сервера логов.
 * Предполагается, что вы скопипастите в реальный конфиг все нужное.
 */

const pm2 = require('pm2');

const { blackList } = require('./cfg/server-cfg.js');


const logPaths = {};

/**
 * Gets log configs from pm2 registry.
 * Modifies the logPaths variable.
 *
 * @return {Promise<Object>} - Object with log paths.
 */
function getCfgsFromPm2() {
  return new Promise(((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      pm2.list((err, procList) => {
        procList.forEach((item) => {
          logPaths[item.name] = {
            out: item.pm2_env.pm_out_log_path,
            err: item.pm2_env.pm_err_log_path,
          };
        });

        pm2.disconnect();

        resolve('Dummy not used value.');

        // const str = jsStringify(cfg, null, 2);
        // console.log(str); // eslint-disable-line no-console
      });
    });
  }));
}

/**
 * Removes black list items from logPaths object.
 * @return {Object} - modified logPaths object.
 */
function removeBlackListedItems() {
  blackList.forEach((disabledName) => {
    if (logPaths[disabledName]) {
      delete logPaths[disabledName];
    }
  });
  return logPaths;
}

/**
 * Returns log paths from all the sources.
 * @return {Promise.<TResult>}
 */
module.exports = function getLogPaths() {
  // TODO: For now, only pm2 source is supported.
  return getCfgsFromPm2()
    .then(removeBlackListedItems);
};

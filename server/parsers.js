#!/usr/bin/env node

'use strict';

// Парсеры.

const { spawn } = require('child_process');
const jsStringify = require('javascript-stringify');

const { log, serverCfg } = require('./common.js');

const getLogPaths = require('./get-log-paths.js');

const allProcs = {};

exports.logLevels = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly',
];

let sendStr; // Функция для посылки строки клиентам.
exports.checkLevel = function checkLevel(level) {
  if (level < 0 || level > 5) {
    throw new Error(`Incorrect log level: ${level}`);
  }
};

exports.getLogLevelIndexByStr = function getLogLevelIndexByStr(strLevel) {
  const ind = exports.logLevels.indexOf(strLevel);
  if (ind === -1) {
    throw new Error(`Incorrect log level: ${strLevel}`);
  }
  return ind;
};

/**
 * Достает из строки уровень логирования.
 * @param str - строка из лога.
 * @return {Number} - уровень логирования.
 */
function getLogLevel(str) {
// Такие бывают форматы в логах:
// '.[36mverbose.[39m', '.[32minfo.[39m', ''
// .[31merror.[39m
// .[33mwarn.[39m
// .[34mdebug.[39m
// .[35msilly.[39m
// Точки здесь это \x1b.
// И ещё вот такой формат бывает:
// .[34mdebug: .[39m

  const reRemoveColors = /\x1b\[\d{2}m/g; // eslint-disable-line no-control-regex
  const strWOColorsLc = str.replace(reRemoveColors, '').toLowerCase();

  for (let i = 0; i < exports.logLevels.length; i++) { // eslint-disable-line no-plusplus
    const strLevel = exports.logLevels[i];
    if (strWOColorsLc.indexOf(`${strLevel}:`) !== -1) {
      return i;
    }
  }

  return undefined;
}

/**
 * Вытаскивание строкового уровня из строки, с привязкой к цветам.
 * Пока эта ф-я нигде не используется. Но, может пригодится в будущем.
 *
 * @return {*}
 */
function getLogLevelByColors(str) { // eslint-disable-line no-unused-vars
  const re = /\x1b\[\d{2}m(.*?) *\x1b/; // eslint-disable-line no-control-regex
  const m = re.exec(str);
  if (!m) {
    return undefined;
  }
  return m[1];
}

/**
 *
 * Создает процесс с вотчером лога.
 *
 * @param {Object} args - объект с аргументами.
 * @param {String} args.procName - имя процесса (из конфига).
 * @param {Boolean} args.isStdout - если true, то вотчер создается для stdout лога,
 * если false - для stderr.
 * @param {String} args.logFile - путь к файлу с логом.
 *
 * @return {Object}
 */
function startLogWatcher(args) {
  const key = args.isStdout ? 'outWatcher' : 'errWatcher';

  const watcher = {
    prevStrLogLevel: undefined, // Уровень логирования для предыдущей строки.
    isStdout: args.isStdout, // stdout или stderr.
    // Префикс для логов, чтобы показывать процесс - источник лога.
    prefix: `${args.procName}-${args.isStdout ? 'out' : 'err'}: `,

    handleData(data) {
      // TODO: Filter the data and broadcast data to subscribers.
      const dataArr = data.split('\n');

      dataArr.forEach((str) => {
        // console.log(str); // Uncomment for debugging, e.g. for filters testing.
        if (str !== '') {
          let curStrLogLevel = getLogLevel(str);
          if (typeof curStrLogLevel === 'undefined') {
            curStrLogLevel = this.prevStrLogLevel;
          } else {
            this.prevStrLogLevel = curStrLogLevel;
          }

          if (sendStr) {
            sendStr({ str: this.prefix + str, curStrLogLevel, isStdout: this.isStdout });
          }
        }
      });
    },
  };

  const reader = spawn('tail', [].concat(serverCfg.tailParams, [args.logFile]));

  reader.stdout.on('data', (data) => {
    watcher.handleData(data.toString());
  });

  reader.on('error', (err) => {
    log.error(`Error at reader "${args.procName} ${key}": ${err}`);
    console.error(err); // eslint-disable-line no-console
  });

  reader.on('close', (code) => {
    // TODO: send it to clients?
    log.warn(`Reader "${args.procName} ${key}" exited with code ${code}`);
  });

  allProcs[args.procName][key] = reader;

  return watcher;
}

/**
 * Запускает вотчеры логов.
 * @param logPaths - объект с путями к stderr и stdout логам.
 */
function startLogWatchers(logPaths) {
  log.info(jsStringify(logPaths, null, 2));
  Object.entries(logPaths).forEach(([procName, procObj]) => {
    if (!allProcs[procName]) {
      allProcs[procName] = {};
    }

    if (procObj.out) {
      startLogWatcher({ procName, isStdout: true, logFile: procObj.out });
    }

    if (procObj.err) {
      startLogWatcher({ procName, isStdout: false, logFile: procObj.err });
    }
  });
}

/**
 * Задержка, для возможного дебага, см. описание опции delayBeforeLogReading
 * в default-server-cfg.js.
 * @return {Promise}
 */
function delay() {
  log.info(`Delay before logs reading: ${serverCfg.delayBeforeLogsReading} ms.`);
  return new Promise(((resolve) => {
    setTimeout(resolve, serverCfg.delayBeforeLogsReading);
  }));
}

/**
 * @param {Function} argSendStr.
 * @return {Promise.<T>|*}
 */
exports.startWatchers = function startWatchers(argSendStr) {
  sendStr = argSendStr;

  return delay()
    .then(getLogPaths)
    .then(startLogWatchers)
    .catch((err) => {
      // Без этих сообщений трудно понять где ошибка.
      console.error('Error: '); // eslint-disable-line no-console
      console.error(err); // eslint-disable-line no-console
    });
};

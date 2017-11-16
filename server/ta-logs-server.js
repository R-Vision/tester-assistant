#!/usr/bin/env node

'use strict';

// Этот скрипт запускается на серверах и открывает вебсокеты на порту 3051.

// const convertAnsiColorsToHtml = (new require('ansi-to-html')()).toHtml;

const Convert = require('ansi-to-html');

const convertAnsiColors = new Convert({
  fg: '#000',
  bg: '#FFF',
});

const WebSocket = require('ws');
const wsWrapper = require('./ws-wrapper.js');

const { log, serverCfg } = require('./common.js');

// const jsStringify = require('javascript-stringify'); // for future logs / debugging.

const parsers = require('./parsers.js');
const handleClientCommand = require('./client-commands-handler.js');

const wss = new WebSocket.Server({ port: serverCfg.port });

/**
 *
 * @param {Object} args
 * @param {String} args.str - строка для лога.
 * @param {Number} args.curStrLogLevel - уровень лога для этой строки.
 * @param {Boolean} args.isStdout - true если stdout лог, false - если stderr лог.
 */
function sendStr(args) {
  // process.stdout.write(`${args.str}\n`); // for debug.

  if (args.str !== '') {
    wss.clients.forEach((client) => {
      if (!args.isStdout || args.curStrLogLevel <= client.minLogLevel) {
        if (client.ansiColorsToHtml) {
          args.str = convertAnsiColors.toHtml(args.str); // eslint-disable-line no-param-reassign
        }
        wsWrapper.send(client, args.str);
      }
    });
  }
}

wss.on('connection', (ws, req) => {
  ws.ip = req.connection.remoteAddress; // eslint-disable-line no-param-reassign

  ws.ansiColorsToHtml = serverCfg.ansiColorsToHtml; // eslint-disable-line no-param-reassign

  // С какого уровня посылать логи этому клиенту.
  ws.minLogLevel = serverCfg.defaultMinLogLevel; // eslint-disable-line no-param-reassign

  // Уровень логирования для предыдущей строки.
  // Если в текущей строке не получается определить уровень логирования, считаем, что уровень
  // как у предыдущей строки.
  ws.prevStrLogLevel = undefined; // eslint-disable-line no-param-reassign
  log.info(`New client ${ws.ip} connected, log level: ${parsers.logLevels[ws.minLogLevel]}`);

  ws.on('message', (msg) => {
    handleClientCommand(msg, ws);
  });

  ws.on('close', () => {
    log.info(`Client closed: ${ws.ip}`);
  });
});

parsers.startWatchers(sendStr);

log.info('ta-logs-server started.');

if (process.platform === 'win32') {
  const rl = require('readline').createInterface({ // eslint-disable-line global-require
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

process.on('SIGINT', () => {
  log.warn('Process is killed by SIGINT');

  // graceful shutdown
  process.exit();
});

#!/usr/bin/env node

'use strict';

// Этот скрипт запускается на серверах и открывает вебсокеты на порту 3051.

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

function escapeLtGt(str) {
  const lTRE = /</g;
  const gTRE = />/g;
  str = str.replace(lTRE, '&lt;');
  str = str.replace(gTRE, '&gt;');
  return str;
}

/**
 *
 * @param {Object} args
 * @param {String} args.chunk - чанк для лога.
 * @param {String} args.prefix - префикс, откуда лог.
 * @param {Number} args.logLevel - уровень лога для этой строки.
 * @param {Boolean} args.isStdout - true если stdout лог, false - если stderr лог.
 */
function sendChunk(args) {
  // process.stdout.write(`${args.str}\n`); // for debug.

  if (args.chunk.length !== 0) {
    args.chunk[0] = `${args.prefix}${args.chunk[0]}`; // eslint-disable-line no-param-reassign

    let str = args.chunk.join('\n');

    // if (args.logLevel < 3) {
    //   console.log('Str for send: ');
    //   console.log(str);
    // }

    wss.clients.forEach((client) => {
      if (!args.isStdout || args.logLevel <= client.minLogLevel) {
        if (client.htmlMode) {
          str = escapeLtGt(str);
          str = convertAnsiColors.toHtml(str);
        }
        wsWrapper.send(client, str);
      }
    });
  }
}

wss.on('connection', (ws, req) => {
  ws.ip = req.connection.remoteAddress; // eslint-disable-line no-param-reassign

  ws.htmlMode = serverCfg.htmlMode; // eslint-disable-line no-param-reassign

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

parsers.startWatchers(sendChunk);

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

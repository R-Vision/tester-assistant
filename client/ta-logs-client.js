#!/usr/bin/env node

// Этот скрипт запускается на клиентах,
// он забирает данные с сервера, указанного в конфиге.
// Путь к конфигу берется из TA_CLIENT_CFG.

'use strict';

const common = require('./common.js');
const WebSocket = require('ws');

const { log, clientCfg } = common;

function startWorld() {
  const ws = new WebSocket(clientCfg.server);

  ws.on('error', (err) => {
    log.error(err);
  });

  ws.on('open', () => {
    log.info(`Connection with server ${clientCfg.server} established.`);
    log.info(`Min log level: ${clientCfg.minLogLevel}`);
    console.log('=========='); // eslint-disable-line no-console

    const data = {
      opt: 'minLogLevel',
      val: clientCfg.minLogLevel,
    };
    const strData = JSON.stringify(data);
    ws.send(strData);
  });

  ws.on('message', (data) => {
    console.log(data.toString()); // eslint-disable-line no-console
  });

  ws.on('close', (event) => {
    log.warn(`Disconnect from: ${clientCfg.server}: ${event}, (deploy started, maybe).`);

    setTimeout(startWorld, clientCfg.reconnectTimeout);
  });
}

startWorld();

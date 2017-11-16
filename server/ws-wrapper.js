'use strict';

/**
 * Этот модуль нужен для централизованной обработки ошибок в WebSockets.
 */

const WebSocket = require('ws');
const { log } = require('./common.js');

/**
 * Враппер над ws.send(). Обрабатывает ошибки.
 * @param {Object} ws - WebSocket object.
 * @param {*} msg - msg to send.
 */
exports.send = function (ws, msg) {
  if (ws.readyState === WebSocket.OPEN) {
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg); // eslint-disable-line no-param-reassign
    }
    ws.send(msg, (err) => {
      if (err) {
        log.error('Error at ws.send().');
        log.error(err);
      }
    });
  } else {
    log.warn('WebSocket is in non open state, no message will be send.');
  }
};

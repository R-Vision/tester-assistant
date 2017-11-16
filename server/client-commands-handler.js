'use strict';

const { log } = require('./common.js');
const wsWrapper = require('./ws-wrapper.js');
const parsers = require('./parsers.js');

const optHandlers = {
  minLogLevel(val, ws) {
    if (typeof val === 'string') {
      // eslint-disable-next-line no-param-reassign
      val = parsers.getLogLevelIndexByStr(val);
    }

    // TODO: add some info about client to log.
    log.info(`minLogLevel: ${parsers.logLevels[ws.minLogLevel]} -> ${parsers.logLevels[val]}`);
    ws.minLogLevel = val; // eslint-disable-line no-param-reassign
  },
  ansiColorsToHtml(val, ws) {
    log.info(`ansiColorsToHtml: ${ws.ansiColorsToHtml} -> ${val}`);
    ws.ansiColorsToHtml = val; // eslint-disable-line no-param-reassign
  },
};

const optHandlersFuncs = Object.keys(optHandlers)
  .filter(key => typeof optHandlers[key] === 'function');

function checkOpt(opt, ws) {
  const index = optHandlersFuncs.indexOf(opt);
  if (index === -1) {
    log.error(`Client sent invalid option: ${opt}`);
    wsWrapper.send(ws, `Invalid options from you, client: ${opt}`);
    return false;
  }
  return true;
}

module.exports = function handleClientCommand(msg, ws) {
  msg = JSON.parse(msg); // eslint-disable-line no-param-reassign
  if (msg.opt && checkOpt(msg.opt, ws)) {
    optHandlers[msg.opt](msg.val, ws);
  }
};

'use strict';

const dzLogPrefix = require('dz-log-prefix');

exports.dzLogPrefix = dzLogPrefix;

exports.log = dzLogPrefix.addPrefixToCommonLogFuncs(require('winston'), '[TA-SERVER]: ');

exports.serverCfg = require('./cfg/server-cfg.js'); // eslint-disable-line import/no-dynamic-require

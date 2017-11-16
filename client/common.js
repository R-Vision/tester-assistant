'use strict';

const dzLogPrefix = require('dz-log-prefix');

exports.dzLogPrefix = dzLogPrefix;

exports.log = dzLogPrefix.addPrefixToCommonLogFuncs(require('winston'), '[TA-CLIENT]: ');

exports.clientCfg = require('./cfg/client-cfg.js'); // eslint-disable-line import/no-dynamic-require

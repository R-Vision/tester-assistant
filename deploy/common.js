'use strict';

const winston = require('winston');
const dzLogPrefix = require('dz-log-prefix');

exports.log = dzLogPrefix.addPrefixToCommonLogFuncs(winston, '[DEPLOY]: ');
exports.cfg = require('./cfg/cfg.js');

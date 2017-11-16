'use strict';

const defaultCfg = require('./default-server-cfg.js');

// eslint-disable-next-line import/no-dynamic-require
const userCfg = process.env.TA_SERVER_CFG ? require(process.env.TA_SERVER_CFG) : {};

module.exports = Object.assign({}, defaultCfg, userCfg);

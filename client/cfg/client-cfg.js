'use strict';

const defaultCfg = require('./default-client-cfg.js');

// eslint-disable-next-line import/no-dynamic-require
const userCfg = process.env.TA_CLIENT_CFG ? require(process.env.TA_CLIENT_CFG) : {};

module.exports = Object.assign({}, defaultCfg, userCfg);

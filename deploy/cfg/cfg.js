'use strict';

// This is a config helper, returns resulting config to all places.

const defCfg = require('./default-cfg.js');

// eslint-disable-next-line import/no-dynamic-require
const userCfg = process.env.DEP_CFG ? require(process.env.DEP_CFG) : {};

module.exports = Object.assign({}, defCfg, userCfg);

'use strict';

const childLogger = require('./src/middlewares/childLogger');
const requestId = require('./src/middlewares/requestId');
const httpAccessLogger = require('./src/middlewares/httpAccessLogger');
const jwtToken = require('./src/middlewares/jwtToken');

module.exports = {
  childLogger,
  requestId,
  httpAccessLogger,
  jwtToken
};

// // //

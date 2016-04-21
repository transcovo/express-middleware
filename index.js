'use strict';

const childLogger = require('./src/middleware/childLogger');
const requestId = require('./src/middleware/requestId');
const httpAccessLogger = require('./src/middleware/httpAccessLogger');
const jwtToken = require('./src/middleware/jwtToken');
const sslRedirect = require('./src/middleware/sslRedirect');

module.exports = {
  childLogger,
  requestId,
  httpAccessLogger,
  jwtToken,
  sslRedirect
};

// // //

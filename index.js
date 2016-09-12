'use strict';

const childLogger = require('./src/middleware/childLogger');
const requestId = require('./src/middleware/requestId');
const httpAccessLogger = require('./src/middleware/httpAccessLogger');
const jwtToken = require('./src/middleware/jwtToken');
const sslRedirect = require('./src/middleware/sslRedirect');
const language = require('./src/middleware/language');
const i18n = require('./src/middleware/i18n');

module.exports = {
  childLogger,
  requestId,
  httpAccessLogger,
  jwtToken,
  sslRedirect,
  language,
  i18n
};

// // //

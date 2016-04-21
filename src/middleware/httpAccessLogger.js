'use strict';

const _ = require('lodash');
const morgan = require('morgan');
const bunyan = require('bunyan');

module.exports = setup;

setup._authorizationToken = authorizationToken; // for testing

// // //

/**
  * Create a logger for http request Morgan-based.
  * Morgan is a good tools to fetch request data (like duration, http version, ...), but it only streams string instead of Json.
  * Then we don't use morgan stream and override morgan formatter to log Json request data.
  *
 * @param  {Object} opts Options
 * @param  {Object} opts.morgan See Morgan options
 * @param  {Function} opts.info  A function which return a method to log a message (by default Bunyan `req.logger` logger is used)
 * @param  {Function} opts.isDebug  Allow to display more information whether true (by default Bunyan `req.logger` logger is used)
 * @param  {Object} opts.tokens  Additionnal Morgan tokens
 * @param  {Function} opts.tokens.authorization This token displays the request jwt token by using `req.token`
 * @param  {Function} opts.tokens.request-id  This token displays the request unique id : `req.requestId`
 * @return {Function}      the middleware
 * @see childLogger.js
 * @see jwtToken.js
 * @see requestId.js
 */
function setup(opts) {
  const options = _.defaults({
    morgan: {
      stream: { write: () => { /* DO NOTHING */ } }
    },
    log: req => req.logger.info.bind(req.logger),
    isDebug: req => req.logger.level() < bunyan.INFO,
    tokens: {
      'request-id': req => req.requestId,
      authorization: authorizationToken
    }
  }, opts);

  // IDP jwt & request ID
  morgan.token('authorization', options.tokens.authorization);
  morgan.token('request-id', options.tokens['request-id']);

  return morgan(format, options.morgan);

  // // //

  /**
   * Allow to format request tokens and log it
   * @param  {Object} tokens  Morgan tokens
   * @param  {Object} req Express request
   * @param  {Object} res Express response
   * @return {Object}        Generated object tokens
   */
  function format(tokens, req, res) {
    const data = {
      time: tokens.date(req, res, 'iso'),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      authorization: tokens.authorization(req, res),
      'remote-user': tokens['remote-user'](req, res),
      'http-version': tokens['http-version'](req, res),
      'content-length': tokens.res(req, res, 'content-length'),
      'request-id': tokens['request-id'](req, res)
    };

    if (options.isDebug(req)) {
      data.referrer = tokens.referrer(req, res);
      data['response-time'] = tokens['response-time'](req, res);
      data['user-agent'] = tokens['user-agent'](req, res);
    }

    options.log(req)(data, '[Express] Http access');

    return data;
  }
}

/**
 * Token to fetch Authorization bearer token
 * @param  {Object} req Express request
 * @return {String}     token without signature
 */
function authorizationToken(req) {
  const token = req.token;
  if (!token) return null;

  const parts = token.split('.');

  if (parts.length < 2) return null;
  return `${parts[0]}.${parts[1]}.[...]`;
}

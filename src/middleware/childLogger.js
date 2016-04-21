'use strict';

const assert = require('assert');

module.exports = setup;

// // //

/**
 * Append a logger to the request. The logger is created with `requestId: req.requestId`
 * @see middleware requestId.js
 * @param  {Object} logger The logger (must have a .child method)
 * @return {Function}        the middleware
 */
function setup(logger) {
  assert.ok(logger, 'Logger is missing');
  assert(typeof logger.child === 'function', 'Logger must have a "child" method');

  /**
   * The middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return function middleware(req, res, next) {
    req.logger = logger.child({ requestId: req.requestId });
    next();
  };
}

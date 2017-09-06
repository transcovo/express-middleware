'use strict';

const uuid = require('node-uuid');

module.exports = setup;

// // //

/**
 * When the id in request url is equal to 'me', then the id is replaced by the authenticated user's id
 * @return {Function} middleware
 */
function setup(name = 'unknown') {
  /**
   * Middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return function middleware(req, res, next) {
    let requestId = req.get('x-request-id');
    let requestPath = req.get('x-request-path');

    if (!requestId) {
      requestId = uuid.v4();
    }

    if (requestPath) {
      requestPath += `.${name}`;
    } else {
      requestPath = name;
    }

    res.set('x-request-id', requestId);
    req.requestId = requestId;

    res.set('x-request-path', requestPath);
    req.requestPath = requestPath;

    next();
  };
}

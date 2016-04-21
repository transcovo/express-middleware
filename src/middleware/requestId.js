'use strict';

const uuid = require('node-uuid');

module.exports = setup;

// // //

/**
 * When the id in request url is equal to 'me', then the id is replaced by the authenticated user's id
 * @return {Function} middleware
 */
function setup() {
  /**
   * Middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return function middleware(req, res, next) {
    let requestId = req.get('x-request-id');

    if (requestId) {
      requestId += `.${uuid.v4()}`;
    } else {
      requestId = uuid.v4();
    }

    res.set('x-request-id', requestId);
    req.requestId = requestId;

    next();
  };
}

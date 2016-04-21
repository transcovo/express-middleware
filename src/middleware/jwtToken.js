'use strict';

module.exports = setup;

// // //

/**
 * Add request token as `token` to req object
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
    const header = req.get('authorization');

    if (req.query && req.query.token) {
      req.token = req.query.token;
      return next();
    }

    if (header) {
      const parts = header.split(' ');
      if (parts[0] === 'Bearer') {
        req.token = parts[1];
        return next();
      }
    }
    next();
  };
}

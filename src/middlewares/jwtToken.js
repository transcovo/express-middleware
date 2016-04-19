'use strict';

module.exports = config;

// // //

/**
 * Add request token as `token` to req object
 * @return {Function} middleware
 */
function config() {
  /**
   * Middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return function middleware(req, res, next) {
    const header = req.get('authorization');
    if (header && header.split(' ')[0] === 'Bearer') {
      req.token = header.split(' ')[1];
    } else if (req.query && req.query.token) {
      req.token = req.query.token;
    }
    next();
  };
}

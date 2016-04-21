'use strict';

module.exports = setup;

/**
 * Setup SSL redirect middleware
 * @param  {Object} opts the middleware options
 * @param  {Object} opts.disable true to disable redirection, false otherwise (default is process.env.DISABLE_SSL_REDIRECT)
 * @return {void}
 */
function setup(opts) {
  const options = Object.assign({
    disable: process.env.DISABLE_SSL_REDIRECT === 'true'
  }, opts);

  /**
  * A middleware to redirect non-https calls to https (ssl redirection)
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
  */
  return function middleware(req, res, next) {
    if (!options.disable && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.get('host')}${req.url}`);
    }
    return next();
  };
}

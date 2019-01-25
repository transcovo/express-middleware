'use strict';

const wrap = require('co-express');

module.exports = setup;

// // //

/**
 * Translation Middleware
 *
 * This function checks if a res.body has been set and will
 * translate all found keys.
 *
 * @param {Object} i18n library configured instance
 * @return {Function} middleware
 */
function setup(i18n) {
  /**
   * Middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return wrap(function* middleware(req, res, next) {
    if (!i18n) {
      throw new Error(
        'Missing i18n dependency, i18n middleware should be initialized with a configured instance of i18n'
      );
    }

    if (res.body) {
      res.body = yield i18n.translate(res.body, req.language);
      return res.json(res.body);
    }

    return next();
  });
}

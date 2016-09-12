'use strict';

const wrap = require('co-express');
const i18n = require('@chauffeur-prive/i18n');

module.exports = setup;

// // //

/**
 * Translation Middleware
 *
 * This function checks if a res.body has been set and will
 * translate all found keys.
 *
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
  return wrap(function* middleware(req, res, next) {
    if (res.body) {
      res.body = yield i18n.translate(res.body, req.language);

      return res.json(res.body);
    }

    return next();
  });
}

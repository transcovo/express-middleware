'use strict';

'use strict';

const jwt = require('jwt-simple');
const wrap = require('co-express');
const createError = require('http-errors');

const EXPIRED = 'Token expired';
const VALIDATION_FAILED = 'Token validation failed';
const NOT_CONNECTED = 'User not connected';
const NEED_KEY = 'IDP secret for JWT is not set';
const ALGORITHM = 'RS256';

/**
 * This middleware has been added in order to centralize the code which validates
 * a jwt token in a single middleware shared by all the micro-services
 * @param {Boolean} ignoreAuth - Ignore the authentication step
 * @param {String} jwtKey - The key used to validate a token's signature
 * @returns {middleware} Express middleware function
 */
function setup(ignoreAuth, jwtKey) {
  /**
   * Express middleware that checks authentication token
   * @param {Object} req Express request
   * @param {Object} res Express result
   * @param {Function} next Express next middleware
   * @returns {void}
   */
  return wrap(function* middleware(req, res, next) {
    if (ignoreAuth) return next();
    if (!jwtKey) {
      throw createError(500, NEED_KEY);
    }

    const token = req.token;
    if (!token) throw createError(401, NOT_CONNECTED);

    let payload;
    try {
      payload = jwt.decode(token, jwtKey, false, [ALGORITHM]);
    } catch (err) {
      if (err.message === EXPIRED) {
        throw createError(401, EXPIRED);
      }
      throw createError(401, VALIDATION_FAILED);
    }

    req.user = payload;
    return next();
  });
}

module.exports = setup;

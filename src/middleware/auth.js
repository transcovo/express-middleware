'use strict';

'use strict';

const jwt = require('jwt-simple');
const createError = require('http-errors');
const _ = require('lodash');

const EXPIRED = 'Token expired';
const VALIDATION_FAILED = 'Token validation failed';
const NOT_CONNECTED = 'User not connected';
const NEED_KEY = 'IDP secret for JWT is not set';
const ALGORITHM = 'RS256';
const PUBLIC_KEYS_SEPARATOR = ';\n';

/**
 * This functions checks several PEM public keys among the
 * ones defined in the keys array. This functions executes jwt.decode on
 * every available PEM public keys and then returns the payload if there is a matching key.
 * Otherwise it throws and error. Among these errors, the 'Token expired' one
 * is threw in priority because it has more details than the 'Token validation failed' error.
 * @param {array} keys - PEM public keys
 * @param {string} token - Issuer JWT token
 * @returns {object} The token's payload
 * @throws Custom error with an HTTP code and message
 */
function validateToken(keys, token) {
  let payload;
  let error;

  _.map(keys, key => {
    try {
      payload = jwt.decode(token, key, false, [ALGORITHM]);
    } catch (err) {
      if (err.message === EXPIRED) {
        error = new createError.Unauthorized(EXPIRED);
      }
      if (_.get(error, 'message') !== EXPIRED) {
        error = new createError.Unauthorized(VALIDATION_FAILED);
      }
    }
  });

  if (!payload) {
    throw error;
  }
  return payload;
}

/**
 * This middleware has been added in order to centralize the code which validates
 * a jwt token in a single middleware shared by all the micro-services.
 * IMPORTANT NOTE: the jwtKeys parameter has to be a string containing all the
 * PEM public keys in a particular format. In order to see how
 * this variable has to look like, please see the file `test/fixtures/auth/keys.fixtures.js`
 * and check how is formatted the property named `severalKeys`.
 * @param {Boolean} ignoreAuth - Ignore the authentication step
 * @param {String} jwtKeys - The keys used to validate a token's signature
 * @returns {middleware} Express middleware function
 */
function setup(ignoreAuth, jwtKeys) {
  let keys = [];
  if (jwtKeys) {
    keys = jwtKeys.split(PUBLIC_KEYS_SEPARATOR);
  }

  /**
   * Express middleware that checks authentication token
   * @param {Object} req Express request
   * @param {Object} res Express result
   * @param {Function} next Express next middleware
   * @returns {void}
   */
  return function middleware(req, res, next) {
    if (ignoreAuth) return next();

    const token = req.token;
    if (!token) throw new createError.Unauthorized(NOT_CONNECTED);

    if (keys.length === 0) {
      throw new createError.InternalServerError(NEED_KEY);
    }

    const payload = validateToken(keys, token);

    req.user = payload;
    return next();
  };
}

module.exports = setup;

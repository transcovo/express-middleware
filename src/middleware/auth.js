'use strict';

'use strict';

const jwt = require('jwt-simple');
const wrap = require('co-express');
const createError = require('http-errors');
const _ = require('lodash');

const EXPIRED = 'Token expired';
const VALIDATION_FAILED = 'Token validation failed';
const NOT_CONNECTED = 'User not connected';
const NEED_KEY = 'IDP secret for JWT is not set';
const ALGORITHM = 'RS256';
const KEY_END_STRING = '-----END PUBLIC KEY-----\n';

/**
 * This functions takes a string of concatenated PEM public keys and splits
 * them in an array.
 * @param {string} keysString - Concatenated PEM public keys
 * @returns {Array} Separated PEM public keys
 */
function retrieveKeys(keysString) {
  const keys = keysString.split(KEY_END_STRING);

  return _.map(keys, (item, index) => (index + 1 === keys.length) ? item : item + '-----END PUBLIC KEY-----');
}

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
        error = createError(401, EXPIRED);
      }
      if (_.get(error, 'message') !== EXPIRED) {
        error = createError(401, VALIDATION_FAILED);
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
  /**
   * Express middleware that checks authentication token
   * @param {Object} req Express request
   * @param {Object} res Express result
   * @param {Function} next Express next middleware
   * @returns {void}
   */
  return wrap(function* middleware(req, res, next) {
    if (ignoreAuth) return next();
    if (!jwtKeys) {
      throw createError(500, NEED_KEY);
    }

    const token = req.token;
    if (!token) throw createError(401, NOT_CONNECTED);

    const keys = retrieveKeys(jwtKeys);
    const payload = validateToken(keys, token);

    req.user = payload;
    return next();
  });
}

module.exports = setup;

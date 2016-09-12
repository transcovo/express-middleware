'use strict';

const parser = require('accept-language-parser');
const createError = require('http-errors');
const _ = require('lodash');
const { languageCodeExists } = require('country-language');

module.exports = setup;

// // //

/**
 * Setup language middleware
 * @param  {Object} opts the language options
 * @param  {Object} opts.languages the languages list
 * @return {void}
 */
function setup({ languages = [] } = {}) {
  if (!languages || !languages.length) {
    throw new Error('opts.languages is mandatory');
  }

  /**
   * Middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return function middleware(req, res, next) {
    const acceptLanguage = req.get('Accept-Language');

    const isOK = _.every(parser.parse(acceptLanguage),
      (language) => languageCodeExists(language.code));

    if (!isOK) throw createError(400, 'error.language');

    const language = parser.pick(languages, acceptLanguage);

    req.language = language || languages[0];

    return next();
  };
}

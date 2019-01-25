'use strict';

const parser = require('accept-language-parser');
const _ = require('lodash');
const { languageCodeExists } = require('country-language');

const DEFAULT_LANGUAGE = 'en';

module.exports = setup;

/**
 * Intersect the list of user accept languages over the list of authorized languages
 * and return the first matching language
 *
 * iterate over the ordered list of user accepted languages and:
 *   1/ find exact match (country + region)
 *   2/ find partial match (country code)
 *
 * @param   {Array} authorizedLanguages Array of authorized/known languages.
 * @param   {Array} userAcceptLanguages Array of parsed languages from Accept-Language.
 * @returns {String|null} The first matching language if found, null otherwise.
 */
function findLanguageMatch(authorizedLanguages, userAcceptLanguages) {
  for (const language of userAcceptLanguages) {
    // find exact matching
    const foundExactLanguage = _.find(
      authorizedLanguages,
      lang => lang === `${language.code}-${language.region}`
    );
    if (foundExactLanguage) return foundExactLanguage;

    // compare language country code only
    const foundCountryCode = _.find(authorizedLanguages, lang => {
      // eslint-disable-line no-loop-func
      const parsedLanguage = _.get(parser.parse(lang), '[0]');
      return parsedLanguage.code === language.code;
    });
    if (foundCountryCode) return foundCountryCode;
  }

  return null;
}

/**
 * Setup language middleware
 * @param  {Object} opts the language options
 * @param  {Object} opts.languages the languages list
 * @return {void}
 */
function setup({ languages = [], defaultLanguage = DEFAULT_LANGUAGE } = {}) {
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

    if (!acceptLanguage) {
      req.language = defaultLanguage;
      return next();
    }

    // parse and order the locales by priority
    const parsedLanguages = parser.parse(acceptLanguage);

    // validate languages
    const userAcceptLanguages = _.filter(parsedLanguages, language =>
      languageCodeExists(language.code)
    );

    // intersect user accept languages with the known languages list
    const language =
      findLanguageMatch(languages, userAcceptLanguages) || defaultLanguage;

    req.language = language;

    return next();
  };
}

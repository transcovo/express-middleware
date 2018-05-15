'use strict';

const parser = require('accept-language-parser');
const _ = require('lodash');
const { languageCodeExists } = require('country-language');

module.exports = setup;

/**
 * Transform a language object from accept-language-parser to a language string.
 *
 * @param   {Object} language The language object.
 * @param   {String} language.code The language code.
 * @param   {String} [language.region] The language region.
 * @returns {String} The language string.
 */
function languageObjectToString(language) {
  return language.region ? `${language.code}-${language.region}` : language.code;
}

/**
 * Find matching language by exact match.
 *
 * To match, the language must have the same country code and region.
 *
 * @param   {Array} languages Array of known languages.
 * @param   {Array} parsedLanguages Array of parsed languages from Accept-Language.
 * @returns {String|null} The first matching language if found, null otherwise.
 */
function findExactLanguageMatch(languages, parsedLanguages) {
  let matchingLanguage;
  _.find(parsedLanguages,
    lang => {
      const languageString = languageObjectToString(lang);
      if (!lang.region) {
        matchingLanguage = findPartialLanguageMatch(languages, [lang]);
      } else if (_.includes(languages, languageString)) {
        matchingLanguage = languageString;
      }
      return matchingLanguage;
    });
  return matchingLanguage || null;
}

/**
 * Find matching language by partial match.
 *
 * To match, the language must have the same country code.
 *
 * @param   {Array} languages Array of known languages.
 * @param   {Array} parsedLanguages Array of parsed languages from Accept-Language.
 * @returns {String|null} The first matching language if found, null otherwise.
 */
function findPartialLanguageMatch(languages, parsedLanguages) {
  const languagesByCode = _.reduce(languages, (languagesResult, language) => {
    const code = language.split('-')[0];
    languagesResult[code] = language;
    return languagesResult;
  }, {});

  let matchingLanguage;
  _.find(parsedLanguages, lang => {
    if (languagesByCode[lang.code]) matchingLanguage = languagesByCode[lang.code];
    return matchingLanguage;
  });
  return matchingLanguage || null;
}

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

    if (!acceptLanguage) {
      req.language = languages[0];
      return next();
    }

    const parsedLanguages = parser.parse(acceptLanguage);

    const validParsedLanguages = _.filter(parsedLanguages,
                                          language => languageCodeExists(language.code));

    const language = findExactLanguageMatch(languages, validParsedLanguages)
      || findPartialLanguageMatch(languages, validParsedLanguages)
      || languages[0];

    req.language = language;

    return next();
  };
}

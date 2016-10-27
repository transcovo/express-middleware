'use strict';

const parser = require('accept-language-parser');
const createError = require('http-errors');
const _ = require('lodash');
const { languageCodeExists } = require('country-language');

module.exports = setup;

function languageObjectToString(language) {
  return language.region ? `${language.code}-${language.region}` : language.code;
}

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
  return matchingLanguage ? languageObjectToString(matchingLanguage) : null;
}

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

    const isOK = _.every(parsedLanguages,
      (language) => languageCodeExists(language.code));
    if (!isOK) throw createError(400, 'error.language');

    const language = findExactLanguageMatch(languages, parsedLanguages)
      || findPartialLanguageMatch(languages, parsedLanguages)
      || languages[0];

    req.language = language;

    return next();
  };
}

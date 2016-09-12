'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const language = require('../../../src/middleware/language.js');

describe('language middleware - language.js', function root() {
  const languages = 'en-US,fr-FR'.split(',');

  it('should take the first available language if the header is missing', function test(done) {
    const req = { get: () => '' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal(languages[0]);
      done();
    });
  });

  it('should take the correct language if the header is present', function test(done) {
    const req = { get: () => languages[1] };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal(languages[1]);
      done();
    });
  });

  it('should take the first available language if the header is present, but the language is not listed', function test(done) {
    const req = { get: () => 'es-ES' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal(languages[0]);
      done();
    });
  });

  it('should throw if languages is not set', function test() {
    expect(() => language({ languages: null })).to.throw();
  });

  it('should throw if languages is set but empty', function test() {
    expect(() => language({ languages: [] })).to.throw();
  });

  it('should throw if the header is not valid', function test() {
    const req = { get: () => 'abcdef' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    expect(() => middleware(req)).to.throw('error.language');
  });
});

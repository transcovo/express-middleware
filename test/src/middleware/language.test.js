'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const language = require('../../../src/middleware/language.js');

describe('language middleware - language.js', function root() {
  const languages = 'en-US,fr-FR'.split(',');

  it('should return the default language value if header Accept-Language is empty', function test(done) {
    const req = { get: () => '' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('en');
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

  it('should take the correct language even if the region is not present', function test(done) {
    const req = { get: () => 'fr;q=1,ca-CA;q=0.9,en-US;q=0.8' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal(languages[1]);
      done();
    });
  });

  it('should take the correct language even if the region is not the same as language', function test(done) {
    const req = { get: () => 'es-ES;q=1,ca-CA;q=0.9,en-FR;q=0.8' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal(languages[0]);
      done();
    });
  });

  it('should take a fallback language if the header is present, but the first language(s) is not listed', function test(done) {
    const req = { get: () => 'ca-CA;q=1,fr-FR;q=0.9' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal(languages[1]);
      done();
    });
  });

  it('should take the default language if the header is present, but the language is not listed', function test(done) {
    const req = { get: () => 'ca-CA;q=1' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('en');
      done();
    });
  });

  it('should match exactly the first language found in the Accept-Language header', function test(done) {
    const req = { get: () => 'fr-FR,en-US;q=0.7' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('fr-FR');
      done();
    });
  });

  it('should match exactly the first language found in the Accept-Language header', function test(done) {
    const req = { get: () => 'fr-FR,en-US;q=0.7' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('fr-FR');
      done();
    });
  });

  it('should match the first language found with a partial matching', function test(done) {
    const req = { get: () => 'en-FR;q=1.0, en-GB;q=0.9, fr-FR;q=0.8, vi-FR;q=0.7' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('en-US');
      done();
    });
  });

  it('should match exactly the user most wanted language', function test(done) {
    const req = { get: () => 'en-US;q=1.0, en-GB;q=0.9, fr-FR;q=0.8, fr-CA;q=0.7' };

    const middleware = language({ languages: ['fr', 'fr-FR', 'fr-CA'] });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('fr-FR');
      done();
    });
  });

  it('should match partially the user most wanted language', function test(done) {
    const req = { get: () => 'en-US;q=1.0, en-GB;q=0.9, fr-CA;q=0.7' };

    const middleware = language({ languages: ['fr-FR', 'fr'] });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('fr-FR');
      done();
    });
  });

  it('should match partially the user most wanted language with the authorized languages country codes', function test(done) {
    const req = { get: () => 'fr;q=1.0, en-GB;q=0.9, fr-CA;q=0.7' };

    const middleware = language({ languages: ['en', 'fr-FR', 'fr-CA'] });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('fr-FR');
      done();
    });
  });

  it('should match language country code for the user most wanted language', function test(done) {
    const req = { get: () => 'fr-FR;q=1.0, en-GB;q=0.9, pt;q=0.7' };

    const middleware = language({ languages: ['en', 'fr', 'pt'] });
    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      expect(req.language).to.equal('fr');
      done();
    });
  });

  it('should throw if languages is not set', function test() {
    expect(() => language({ languages: null })).to.throw();
  });

  it('should throw if languages is set but empty', function test() {
    expect(() => language({ languages: [] })).to.throw();
  });

  it('should return the default language if the language can not be parsed', function* it() {
    const req = { get: () => 'invalid' };

    const middleware = language({ languages });
    expect(middleware).to.be.instanceof(Function);

    yield cb => middleware(req, null, () => {
      expect(req.language).to.equal('en');
      cb();
    });
  });
});

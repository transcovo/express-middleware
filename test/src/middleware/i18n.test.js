'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const sinon = require('sinon');
const i18n = require('@chauffeur-prive/i18n');
const i18nMW = require('../../../src/middleware/i18n.js');

describe('i18n middleware - i18n.js', function root() {
  const translations = {
    'en-US': {
      'test-key': 'test-en'
    },
    'fr-FR': {
      'test-key': 'test-fr'
    }
  };

  const body = {
    '@translate': {
      key: 'test-key',
    }
  };

  before(function* before() {
    yield i18n.engine.init();

    i18n.engine.addTranslations('fr-FR', translations['fr-FR']);
    i18n.engine.addTranslations('en-US', translations['en-US']);
  });

  it('should correctly translate a body (fr)', function* test() {
    const req = {
      language: 'fr-FR'
    };
    const res = {
      body,
      json: sinon.spy()
    };

    const middleware = i18nMW();
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res);

    sinon.assert.called(res.json);
    expect(res.body).to.equal('test-fr');
  });

  it('should correctly translate a body (en)', function* test() {
    const req = {
      language: 'en-US'
    };
    const res = {
      body,
      json: sinon.spy()
    };

    const middleware = i18nMW();
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res);

    sinon.assert.called(res.json);
    expect(res.body).to.equal('test-en');
  });

  it('should not translate a body if language is missing', function* test() {
    const req = {
      language: 'es-ES'
    };
    const res = {
      body,
      json: sinon.spy()
    };

    const middleware = i18nMW();
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res);

    sinon.assert.called(res.json);
    expect(res.body).to.equal('test-key');
  });

  it('should not alter non body', function* test() {
    const req = {
      language: 'en-US'
    };
    const res = {
      body2: body,
      json: sinon.spy()
    };

    const next = sinon.spy();

    const middleware = i18nMW();
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res, next);

    sinon.assert.called(next);
    sinon.assert.notCalled(res.json);
    expect(res.body2).to.deep.equal(body);
  });
});

'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const sinon = require('sinon');
const i18nMW = require('../../../src/middleware/i18n.js');

describe('i18n middleware - i18n.js', function root() {
  const body = {
    '@translate': {
      key: 'test-key',
    }
  };

  it('should do nothing if i18n is falsey', function* test() {
    const req = {
      language: 'en-US'
    };
    const res = {
      body,
      json: sinon.spy()
    };

    const next = sinon.spy();

    const middleware = i18nMW();
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res, next);

    sinon.assert.called(next);
    sinon.assert.notCalled(res.json);
    expect(res.body).to.deep.equal(body);
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

  it('should call translate successfully if i18n is passed as a generator and body exists', function* test() {
    const req = {
      language: 'fr-FR'
    };
    const res = {
      body,
      json: sinon.spy()
    };
    const next = sinon.spy();

    const i18nObj = { obj: null, lang: null };
    const i18n = {
      translate: function *gen(obj, lang) {
        i18nObj.obj = obj;
        i18nObj.lang = lang;
        return obj;
      }
    };

    const middleware = i18nMW(i18n);
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res);

    expect(res.json.args).to.deep.equal([
      [{
        '@translate': {
          key: 'test-key',
        }
      }]
    ]);
    sinon.assert.notCalled(next);
    expect(res.body).to.deep.equal(body);
    expect(i18nObj).to.deep.equal({
      lang: 'fr-FR',
      obj: {
        '@translate': {
          key: 'test-key'
        }
      }
    });
  });
});

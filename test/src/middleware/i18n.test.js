'use strict';

/* eslint no-unused-expressions:0 */

const { expect } = require('chai');
const sinon = require('sinon');
const i18nMW = require('../../../src/middleware/i18n.js');

describe('i18n middleware - i18n.js', () => {
  const body = {
    '@translate': {
      key: 'test-key'
    }
  };
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw an exception if i18n is not injected', function* test() {
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

    expect(next.args[0][0].message).to.deep.equal(
      'Missing i18n dependency, i18n middleware should be initialized with a configured instance of i18n'
    );
    expect(next.callCount).to.equal(1);
    expect(res.json.callCount).to.equal(0);
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

    const i18n = {
      translate: () => {}
    };
    sandbox.stub(i18n, 'translate').resolves('translated value');

    const middleware = i18nMW(i18n);
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res, next);

    expect(next.callCount).to.equal(1);
    expect(res.json.callCount).to.equal(0);
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
      translate: (obj, lang) => {
        i18nObj.obj = obj;
        i18nObj.lang = lang;
        return obj;
      }
    };

    const middleware = i18nMW(i18n);
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res);

    expect(res.json.args).to.deep.equal([
      [
        {
          '@translate': {
            key: 'test-key'
          }
        }
      ]
    ]);
    expect(next.callCount).to.equal(0);
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

  it('should call translate successfully if i18n is passed as a promise and body exists', function* test() {
    const req = {
      language: 'fr-FR'
    };
    const res = {
      body,
      json: sinon.spy()
    };
    const next = sinon.spy();

    const i18n = {
      translate: () => {}
    };
    sandbox.stub(i18n, 'translate').resolves('translated value');

    const middleware = i18nMW(i18n);
    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res);

    expect(res.json.args).to.deep.equal([['translated value']]);
    expect(next.callCount).to.equal(0);
    expect(res.body).to.deep.equal('translated value');
  });
});

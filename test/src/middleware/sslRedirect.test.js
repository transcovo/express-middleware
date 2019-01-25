'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const sslRedirect = require('../../../src/middleware/sslRedirect.js');

const host = 'www.chauffeur-prive.com';

describe('ssl redirect middleware - sslRedirect.js', () => {
  afterEach(() => {
    delete process.env.DISABLE_SSL_REDIRECT;
  });

  describe('with environment variable', () => {
    it('should not redirect when disabled', done => {
      process.env.DISABLE_SSL_REDIRECT = 'true'; // string to simulate real env var

      const middleware = sslRedirect();
      middleware(null, null, done);
    });

    it('should redirect when enabled', done => {
      const req = { get: () => {}, url: '/about.html' };
      const res = {
        redirect: url => {
          expect(url).to.equal('https://www.chauffeur-prive.com/about.html');
          done();
        }
      };

      const reqGetStub = sinon.stub(req, 'get');
      reqGetStub.onCall(0).returns('http');
      reqGetStub.onCall(1).returns(host);

      const middleware = sslRedirect();
      middleware(req, res);
    });

    it('should do nothing when url is secured', done => {
      process.env.DISABLE_SSL_REDIRECT = 'false';
      const req = { get: () => {}, url: '/about.html' };

      const reqGetStub = sinon.stub(req, 'get');
      reqGetStub.onCall(0).returns('https');

      const middleware = sslRedirect();
      middleware(req, null, done);
    });
  });

  describe('with setup option', () => {
    it('should not redirect when disabled', done => {
      process.env.DISABLE_SSL_REDIRECT = 'false'; // string to simulate real env var

      const middleware = sslRedirect({ disable: true });
      middleware(null, null, done);
    });

    it('should redirect when enabled', done => {
      const req = { get: () => {}, url: '/users/joe_mocha' };
      const res = {
        redirect: url => {
          expect(url).to.equal(
            'https://www.chauffeur-prive.com/users/joe_mocha'
          );
          done();
        }
      };

      const reqGetStub = sinon.stub(req, 'get');
      reqGetStub.onCall(0).returns('http');
      reqGetStub.onCall(1).returns(host);

      const middleware = sslRedirect({ disable: false });
      middleware(req, res);
    });

    it('should do nothing when url is secured', done => {
      const req = { get: () => {}, url: '/about.html' };

      const reqGetStub = sinon.stub(req, 'get');
      reqGetStub.onCall(0).returns('https');

      const middleware = sslRedirect({ disable: true });
      middleware(req, null, done);
    });
  });
});

'use strict';

const expect = require('chai').expect;
const createError = require('http-errors');
const sinon = require('sinon');
const _ = require('lodash');

const auth = require('../../../src/middleware/auth');
const keysFixtures = require('../../fixtures/auth/keys.fixtures');
const tokensFixtures = require('../../fixtures/auth/tokens.fixtures');

describe('Authentication middleware - auth.js', function root() {
  let sandbox;

  before(function () {
    sandbox = sinon.sandbox.create();
  });

  beforeEach(function () {
    sandbox.restore();
  });

  it('should ignore auth if the config ignoreAuth is true', function* test() {
    const middleware = auth(true, null);
    const errorSpy = sandbox.spy(createError);
    const req = {
      get: () => {
      }
    };
    const res = {
      set: () => {
      }
    };

    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res, () => {
      expect(req.token).to.equal(undefined);
      expect(req.user).to.equal(undefined);
      expect(errorSpy.callCount).to.equal(0);
    });
  });

  it('should throw error if no key is provided', function* test() {
    const middleware = auth(false, null);
    const req = {
      get: () => {
      }
    };
    const res = {
      set: () => {
      }
    };

    expect(middleware).to.be.instanceof(Function);

    try {
      yield middleware(req, res, _.noop());
    } catch (err) {
      expect(err.status).to.equal(500);
      expect(err.message).to.equal('IDP secret for JWT is not set');
    }
  });

  it('should throw error if no token is provided in the request', function* test() {
    const middleware = auth(false, keysFixtures.original);
    const req = {
      get: () => {
      }
    };
    const res = {
      set: () => {
      }
    };

    expect(middleware).to.be.instanceof(Function);

    try {
      yield middleware(req, res, _.noop());
    } catch (err) {
      expect(err.status).to.equal(401);
      expect(err.message).to.equal('User not connected');
    }
  });

  it('should throw error if the token signature is invalid', function* test() {
    const middleware = auth(false, keysFixtures.original);
    const req = {
      token: tokensFixtures.original.invalidSignature,
      get: () => {
      }
    };
    const res = {
      set: () => {
      }
    };

    expect(middleware).to.be.instanceof(Function);

    try {
      yield middleware(req, res, _.noop());
    } catch (err) {
      expect(err.status).to.equal(401);
      expect(err.message).to.equal('Token validation failed');
    }
  });

  it('should throw error if the token is expired', function* test() {
    const middleware = auth(false, keysFixtures.original);
    const req = {
      token: tokensFixtures.original.expired,
      get: () => {
      }
    };
    const res = {
      set: () => {
      }
    };

    expect(middleware).to.be.instanceof(Function);

    try {
      yield middleware(req, res, _.noop());
    } catch (err) {
      expect(err.status).to.equal(401);
      expect(err.message).to.equal('Token expired');
    }
  });

  it('should set the token payload in the request if the token is valid', function* test() {
    const middleware = auth(false, keysFixtures.original);
    const errorSpy = sandbox.spy(createError);
    const req = {
      token: tokensFixtures.original.valid,
      get: () => {
      }
    };
    const res = {
      set: () => {
      }
    };

    expect(middleware).to.be.instanceof(Function);

    yield middleware(req, res, () => {
      expect(req.token).to.equal(tokensFixtures.original.valid);
      expect(req.user).to.deep.equal({
        foo: 'bar',
        iat: 1506357382
      });
      expect(errorSpy.callCount).to.equal(0);
    });
  });
});

'use strict';

const sinon = require('sinon');
const { expect } = require('chai');

const blacklistIPs = require('../../../src/middleware/blacklistIPs');

describe('blacklistIPs middleware', () => {
  const sandbox = sinon.sandbox.create();
  const blacklistedIP = '255.255.255.240';
  const otherIP = '255.255.255.241';

  before(() => {
    process.env.IP_BLACKLIST = '';
  });

  after(() => {
    sandbox.restore();
  });

  it('should be a function', () => {
    const middleware = blacklistIPs();
    expect(middleware).to.be.instanceof(Function);
  });

  it('should do nothing when IP_BLACKLIST is not set', done => {
    const req = {
      get: () => blacklistedIP,
      connection: { remoteAddress: otherIP }
    };
    const res = { set: () => {} };

    const middleware = blacklistIPs();

    middleware(req, res, err => {
      /* eslint-disable no-unused-expressions */
      expect(err).to.not.exist;
      done();
    });
  });

  it('should accept a non-blacklisted ip', done => {
    sandbox.stub(process.env, 'IP_BLACKLIST').value(blacklistedIP);
    const req = { get: () => otherIP, connection: { remoteAddress: otherIP } };
    const res = { set: () => {} };

    const middleware = blacklistIPs();

    middleware(req, res, err => {
      /* eslint-disable no-unused-expressions */
      expect(err).to.not.exist;
      done();
    });
  });

  it('should reject a blacklisted ip from x-forwarded-for', done => {
    sandbox.stub(process.env, 'IP_BLACKLIST').value(blacklistedIP);
    const req = {
      get: () => otherIP,
      connection: { remoteAddress: blacklistedIP }
    };
    const res = { set: () => {} };

    const middleware = blacklistIPs();

    middleware(req, res, err => {
      expect(err).to.be.an('Error');
      done();
    });
  });

  it('should reject a blacklisted ip from remoteAddress', done => {
    sandbox.stub(process.env, 'IP_BLACKLIST').value(blacklistedIP);
    const req = {
      get: () => otherIP,
      connection: { remoteAddress: blacklistedIP }
    };
    const res = { set: () => {} };

    const middleware = blacklistIPs();

    middleware(req, res, err => {
      expect(err).to.be.an('Error');
      done();
    });
  });

  it('should work with comma-separated lists as well', done => {
    sandbox
      .stub(process.env, 'IP_BLACKLIST')
      .value(`127.127.127.0,${blacklistedIP}`);
    const req = {
      get: () => '',
      connection: { remoteAddress: `127.0.0.1,${blacklistedIP}` }
    };
    const res = { set: () => {} };

    const middleware = blacklistIPs();

    middleware(req, res, err => {
      expect(err).to.be.an('Error');
      done();
    });
  });

  it('should ignore empty values from lists', done => {
    sandbox
      .stub(process.env, 'IP_BLACKLIST')
      .value(`,127.127.127.0,,${blacklistedIP}`);
    const req = {
      get: () => ',,',
      connection: { remoteAddress: `,127.0.0.1,,${blacklistedIP},` }
    };
    const res = { set: () => {} };

    const middleware = blacklistIPs();

    middleware(req, res, err => {
      expect(err).to.be.an('Error');
      done();
    });
  });
});

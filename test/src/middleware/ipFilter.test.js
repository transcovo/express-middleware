'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const ipFilter = require('../../../src/middleware/ipFilter.js');

describe('No filtering - ipFilter.js', function root() {
  it('should correctly create but do nothing', function test(done) {
    process.env.FILTER_IP = false;
    process.env.PROTECTED_IPS = '127.0.0.1';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.1' } };
    const res = { set: () => { } };
    const opts = {};

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });
});

describe('deny ip addresses - ipFilter.js', function root() {
  it('should correctly create and be called with no restrictions', function test(done) {
    process.env.FILTER_IP = false;

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.1' } };
    const res = { set: () => { } };
    const opts = { };

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should correctly create and be called', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.1' } };
    const res = { set: () => { } };
    const opts = {};

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should not deny the IP', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.2' } };
    const res = { set: () => { } };
    const opts = { };

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should deny the IP address', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.1' } };
    const res = { set: () => { } };
    /* eslint-disable no-console */
    const opts = { log: true, logger: console.log };
    /* eslint-enable no-console */
    const middleware = ipFilter(opts);
    try {
      middleware(req, res, done);
    } catch (err) {
      expect(err.message).to.equal('Access denied to IP address: 127.0.0.1');
      done();
    }
  });

  it('should deny the ip using a range', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.127.127.0 127.0.0.1,127.0.0.10';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.5' } };
    const res = { set: () => { } };
    const opts = { };

    const middleware = ipFilter(opts);
    try {
      middleware(req, res, done);
    } catch (err) {
      expect(err.message).to.equal('Access denied to IP address: 127.0.0.5');
      done();
    }
  });

  it('should deny the ip using a range', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.127.127.0 127.0.0.1,127.0.0.10';

    const req = { get: () => { }, connection: { remoteAddress: '127.127.0.5' } };
    const res = { set: () => { } };
    const opts = { };

    const middleware = ipFilter(opts);
    try {
      middleware(req, res, done);
    } catch (err) {
      expect(err.message).to.equal('Access denied to IP address: 127.127.0.5');
      done();
    }
  });

  it('should deny the ip using a range', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.127.127.0 127.0.0.1,';

    const req = { get: () => { }, connection: { remoteAddress: '127.127.0.5' } };
    const res = { set: () => { } };
    const opts = { };

    const middleware = ipFilter(opts);
    try {
      middleware(req, res, done);
    } catch (err) {
      expect(err.message).to.equal('Access denied to IP address: 127.127.0.5');
      done();
    }
  });

  it('should deny CIDR subnet', function test(done) {
    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.5' } };
    const res = { set: () => { } };
    const opts = { };

    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1/24';

    const middleware = ipFilter(opts);
    try {
      middleware(req, res, done);
    } catch (err) {
      expect(err.message).to.equal('Access denied to IP address: 127.0.0.5');
      done();
    }
  });
});

describe('allow ip addresses - ipFilter.js', function root() {
  it('should correctly create and be called', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.1' } };
    const res = { set: () => { } };
    const opts = { mode: 'allow' };

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should not allow the IP', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.2' } };
    const res = { set: () => { } };
    const opts = { mode: 'allow' };

    try {
      const middleware = ipFilter(opts);
      expect(middleware).to.be.instanceof(Function);

      middleware(req, res, done);
    } catch (err) {
      expect(err.message).to.equal('Access denied to IP address: 127.0.0.2');
      done();
    }
  });

  it('should allow using allowedHeaders', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.2';

    const req = {
      headers: {
        'x-forwarded-for': '127.0.0.2'
      }
    };
    const res = { set: () => { } };
    /* eslint-disable no-console */
    const opts = { log: true, logger: console.log, mode: 'allow', allowedHeaders: ['', 'x-forwarded-for'] };
    /* eslint-enable no-console */
    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should allow using allowedHeaders with port', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.2';

    const req = {
      headers: {
        'x-forwarded-for': '127.0.0.2:84849'
      }
    };
    const res = { set: () => { } };
    const opts = { mode: 'allow', allowedHeaders: ['', 'x-forwarded-for'] };

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should allow the IP address', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.1' } };
    const res = { set: () => { } };
    const opts = { mode: 'allow' };

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should allow the ip using a range', function test(done) {
    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.127.127.0 127.0.0.1,127.0.0.10';

    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.5' } };
    const res = { set: () => { } };
    const opts = { mode: 'allow' };

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should allow CIDR subnet', function test(done) {
    const req = { get: () => { }, connection: { remoteAddress: '127.0.0.5' } };
    const res = { set: () => { } };
    const opts = { mode: 'allow' };

    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1/24';

    const middleware = ipFilter(opts);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should allow CIDR subnet', function test(done) {
    const req = { get: () => { }, connection: { remoteAddress: '127.127.0.5' } };
    const res = { set: () => { } };
    const opts = { mode: 'allow' };

    process.env.FILTER_IP = true;
    process.env.PROTECTED_IPS = '127.0.0.1/24';

    try {
      const middleware = ipFilter(opts);
      expect(middleware).to.be.instanceof(Function);

      middleware(req, res, done);
    } catch (err) {
      expect(err.message).to.equal('Access denied to IP address: 127.127.0.5');
      done();
    }
  });
});

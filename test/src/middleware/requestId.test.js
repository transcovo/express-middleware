'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const sinon = require('sinon');
const requestId = require('../../../src/middleware/requestId.js');

describe('request id middleware - requestId.js', function root() {
  it('should correctly created and called', function test(done) {
    const req = { get: () => { } };
    const res = { set: () => { } };

    const middleware = requestId();
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, done);
  });

  it('should create an new id', function test() {
    const req = { get: () => { } };
    const res = { set: () => { } };

    const getSpy = sinon.spy(req, 'get');
    const setSpy = sinon.spy(res, 'set');

    const middleware = requestId();

    middleware(req, res, () => {});

    getSpy.withArgs('x-request-id').calledOnce;
    setSpy.calledOnce;
    const args = setSpy.args[0];
    expect(args.length).to.equal(2);
    expect(args[0]).to.equal('x-request-id');
    expect(args[1]).to.match(/^[0-9a-f-]+$/);

    expect(req.requestId).to.equal(args[1]);
  });

  it('should concate a new id to the current x-request-id header', function test() {
    const currentReqId = '6ca66f56-dec4-45dd-9dd0-fd1fe6806b18';
    const req = { get: () => currentReqId };
    const res = { set: () => { } };

    const getSpy = sinon.spy(req, 'get');
    const setSpy = sinon.spy(res, 'set');

    const middleware = requestId();

    middleware(req, res, () => {});

    getSpy.withArgs('x-request-id').calledOnce;
    setSpy.calledOnce;
    const args = setSpy.args[0];
    expect(args.length).to.equal(2);
    expect(args[0]).to.equal('x-request-id');
    expect(args[1]).to.match(new RegExp(`^${currentReqId}\.[0-9a-f-]+$`));

    expect(req.requestId).to.equal(args[1]);
  });
});

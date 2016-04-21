'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const sinon = require('sinon');
const childLogger = require('../../../src/middleware/childLogger.js');

describe('child logger middleware - childLogger.js', function root() {
  it('should throw assertion error when logger is missing', function test() {
    expect(childLogger).to.throw('AssertionError');
  });

  it('should work with a requestId', function test(done) {
    const req = { requestId: '110e8400-e29b-11d4-a716-446655440000' };
    const logger = { child: () => { } };
    const childSpy = sinon.spy(logger, 'child');
    const middleware = childLogger(logger);

    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      childSpy.calledOnce;
      expect(childSpy.args[0].length).to.equal(1);
      expect(childSpy.args[0][0]).to.deep.equal({ requestId: '110e8400-e29b-11d4-a716-446655440000' });
      done();
    });
  });

  it('should work without a requestId', function test(done) {
    const req = { };
    const logger = { child: () => { } };
    const childSpy = sinon.spy(logger, 'child');
    const middleware = childLogger(logger);

    expect(middleware).to.be.instanceof(Function);

    middleware(req, null, () => {
      childSpy.calledOnce;
      expect(childSpy.args[0].length).to.equal(1);
      expect(childSpy.args[0][0]).to.deep.equal({ requestId: undefined });
      done();
    });
  });
});

'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const httpAccessLogger = require('../../../src/middleware/httpAccessLogger.js');

describe('http access logger middleware - httpAccessLogger.js', function root() {
  it('should work in normal mode', function test(done) {
    const logger = { info: assertLog, level: () => 100 };
    const req = {
      logger,
      headers: {}, // required by morgan
    };

    const middleware = httpAccessLogger(logger);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, { }, () => {});

    /**
     * Assert log result
     * @param  {Objecy} data    bundle of request properties
     * @param  {String} message log message
     * @return {void}
     */
    function assertLog(data, message) {
      expect(data).to.be.instanceof(Object);
      expect(message).to.equal('[Express] Http access');
      done();
    }
  });

  it('should work in debug mode with a request id and a token', function test(done) {
    const tokenParts = [
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9',
      'eyJ1c2VyX2lkIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwic3ViIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwicm9sZXMiOlt7Im5hbWUiOiJjcDplbXBsb3llZTp0ZWNoOiJ9XSwiaXNzIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwiZGlzcGxheV9uYW1lIjoieW9hbm4gZ290dGhpbGYiLCJpYXQiOjE0NjEwNzA1MzksImV4cCI6MTQ2MTI0MzMzOX0',
      'd4lNVGD2367GIqha9WjwQ3ALvDn1KcVVPK4ZRjnC2pV9vMtixCgQfivOpnA8M_xU9-JWTgRk2R7YVT88AIBm_HMqVdtQDwoU_BwRcF-yj6j3pbiTPLrCQO_-VyFlCq-t57xba37_e6bqU8PW98OGigE1n_j59IWYXXlY_1iy2XlumE_CXuDSxlAxyOzU16czukR4fB_ljHvWG9YisZQ5tSBNdb5abHESE8lQ2gvnrmE7parukQTaDEVgm00PL5LpTVbmgs8L1a5S21Xpqr2eXOQ8ospM4NU2bne1gyfgksq83ve9bwTJtgiUjN5KFLvpPnL9DVl9FUk-fZAj3pYB9UiJeMtN4jjzD3-aQhosHnBmbJt-94vscS2aPj9OxjeIvkDxJsfkaA9rISUzf91PM_un-I6NbM5z1LdIuI55oWA8SGXAUxONRqC-tOEZbr0Kp-q02CTKnJgdFhiUgw5_K_jApuHEXbsXy2F9MCQT3q1_3FwA1MM0DyNrnWU-hw4EP3lBPMzGWDL-O5Ei1vOphurCMoRT2kx-MJQ2tkRlCRPUvFlLTiVrKL2Hccg3N9QiipO1jPoasxAhSwybCLo64yX2hu0hZ_dxA3mulQmRTP-fclndgtA7So1P0bH_O2ZR0sQJMlI3qVGqLSQPnYpZOncJPdC9g2OR8g_LCaxqksk'
    ];
    const requestId = '6ca66f56-dec4-45dd-9dd0-fd1fe6806b18';

    const logger = { info: assertLog, level: () => 0 };
    const req = {
      logger,
      headers: {}, // required by morgan
      requestId,
      token: tokenParts.join('.')
    };

    const middleware = httpAccessLogger(logger);
    expect(middleware).to.be.instanceof(Function);

    middleware(req, { }, () => {});

    /**
     * Assert log result
     * @param  {Objecy} data    bundle of request properties
     * @param  {String} message log message
     * @return {void}
     */
    function assertLog(data, message) {
      expect(data).to.be.instanceof(Object);
      expect(data['request-id']).to.equal(requestId);
      expect(data.authorization).to.equal(`${tokenParts[0]}.${tokenParts[1]}.[...]`);
      expect(message).to.equal('[Express] Http access');
      done();
    }
  });

  describe('authorization morgan token - #authorizationToken', function desc() {
    it('should return null when no jwt is provided', function test() {
      const req = {};
      const auth = httpAccessLogger._authorizationToken(req);
      expect(auth).to.not.exist;
    });

    it('should return null when format is unknown', function test() {
      const req = { token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9' };
      const auth = httpAccessLogger._authorizationToken(req);
      expect(auth).to.not.exist;
    });
  });
});

'use strict';
/* eslint no-unused-expressions:0 */

const expect = require('chai').expect;
const jwtToken = require('../../../src/middleware/jwtToken.js');

describe('jwt token middleware - jwtToken.js', function root() {
  it('should correctly created and called without token', function test(done) {
    const req = { get: () => { } };
    const res = { set: () => { } };

    const middleware = jwtToken();
    expect(middleware).to.be.instanceof(Function);

    middleware(req, res, () => {
      expect(req.token).to.not.exist;
      done();
    });
  });

  it('should add to req the token in headers', function test() {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwic3ViIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwicm9sZXMiOlt7Im5hbWUiOiJjcDplbXBsb3llZTp0ZWNoOiJ9XSwiaXNzIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwiZGlzcGxheV9uYW1lIjoieW9hbm4gZ290dGhpbGYiLCJpYXQiOjE0NjEwNzA1MzksImV4cCI6MTQ2MTI0MzMzOX0.d4lNVGD2367GIqha9WjwQ3ALvDn1KcVVPK4ZRjnC2pV9vMtixCgQfivOpnA8M_xU9-JWTgRk2R7YVT88AIBm_HMqVdtQDwoU_BwRcF-yj6j3pbiTPLrCQO_-VyFlCq-t57xba37_e6bqU8PW98OGigE1n_j59IWYXXlY_1iy2XlumE_CXuDSxlAxyOzU16czukR4fB_ljHvWG9YisZQ5tSBNdb5abHESE8lQ2gvnrmE7parukQTaDEVgm00PL5LpTVbmgs8L1a5S21Xpqr2eXOQ8ospM4NU2bne1gyfgksq83ve9bwTJtgiUjN5KFLvpPnL9DVl9FUk-fZAj3pYB9UiJeMtN4jjzD3-aQhosHnBmbJt-94vscS2aPj9OxjeIvkDxJsfkaA9rISUzf91PM_un-I6NbM5z1LdIuI55oWA8SGXAUxONRqC-tOEZbr0Kp-q02CTKnJgdFhiUgw5_K_jApuHEXbsXy2F9MCQT3q1_3FwA1MM0DyNrnWU-hw4EP3lBPMzGWDL-O5Ei1vOphurCMoRT2kx-MJQ2tkRlCRPUvFlLTiVrKL2Hccg3N9QiipO1jPoasxAhSwybCLo64yX2hu0hZ_dxA3mulQmRTP-fclndgtA7So1P0bH_O2ZR0sQJMlI3qVGqLSQPnYpZOncJPdC9g2OR8g_LCaxqksk';
    const req = { get: () => `Bearer ${token}` };
    const middleware = jwtToken();

    middleware(req, undefined, () => {});

    expect(req.token).to.equal(token);
  });

  it('should not add the malformatted token in req', function test() {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwic3ViIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwicm9sZXMiOlt7Im5hbWUiOiJjcDplbXBsb3llZTp0ZWNoOiJ9XSwiaXNzIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwiZGlzcGxheV9uYW1lIjoieW9hbm4gZ290dGhpbGYiLCJpYXQiOjE0NjEwNzA1MzksImV4cCI6MTQ2MTI0MzMzOX0.d4lNVGD2367GIqha9WjwQ3ALvDn1KcVVPK4ZRjnC2pV9vMtixCgQfivOpnA8M_xU9-JWTgRk2R7YVT88AIBm_HMqVdtQDwoU_BwRcF-yj6j3pbiTPLrCQO_-VyFlCq-t57xba37_e6bqU8PW98OGigE1n_j59IWYXXlY_1iy2XlumE_CXuDSxlAxyOzU16czukR4fB_ljHvWG9YisZQ5tSBNdb5abHESE8lQ2gvnrmE7parukQTaDEVgm00PL5LpTVbmgs8L1a5S21Xpqr2eXOQ8ospM4NU2bne1gyfgksq83ve9bwTJtgiUjN5KFLvpPnL9DVl9FUk-fZAj3pYB9UiJeMtN4jjzD3-aQhosHnBmbJt-94vscS2aPj9OxjeIvkDxJsfkaA9rISUzf91PM_un-I6NbM5z1LdIuI55oWA8SGXAUxONRqC-tOEZbr0Kp-q02CTKnJgdFhiUgw5_K_jApuHEXbsXy2F9MCQT3q1_3FwA1MM0DyNrnWU-hw4EP3lBPMzGWDL-O5Ei1vOphurCMoRT2kx-MJQ2tkRlCRPUvFlLTiVrKL2Hccg3N9QiipO1jPoasxAhSwybCLo64yX2hu0hZ_dxA3mulQmRTP-fclndgtA7So1P0bH_O2ZR0sQJMlI3qVGqLSQPnYpZOncJPdC9g2OR8g_LCaxqksk';
    const req = { get: () => token };
    const middleware = jwtToken();

    middleware(req, undefined, () => {});

    expect(req.token).to.not.exist;
  });

  it('should add to req the token in query params', function test() {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwic3ViIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwicm9sZXMiOlt7Im5hbWUiOiJjcDplbXBsb3llZTp0ZWNoOiJ9XSwiaXNzIjoiNTY3MmRmNDczMjZkZWNmNzA2OWZiZTlkIiwiZGlzcGxheV9uYW1lIjoieW9hbm4gZ290dGhpbGYiLCJpYXQiOjE0NjEwNzA1MzksImV4cCI6MTQ2MTI0MzMzOX0.d4lNVGD2367GIqha9WjwQ3ALvDn1KcVVPK4ZRjnC2pV9vMtixCgQfivOpnA8M_xU9-JWTgRk2R7YVT88AIBm_HMqVdtQDwoU_BwRcF-yj6j3pbiTPLrCQO_-VyFlCq-t57xba37_e6bqU8PW98OGigE1n_j59IWYXXlY_1iy2XlumE_CXuDSxlAxyOzU16czukR4fB_ljHvWG9YisZQ5tSBNdb5abHESE8lQ2gvnrmE7parukQTaDEVgm00PL5LpTVbmgs8L1a5S21Xpqr2eXOQ8ospM4NU2bne1gyfgksq83ve9bwTJtgiUjN5KFLvpPnL9DVl9FUk-fZAj3pYB9UiJeMtN4jjzD3-aQhosHnBmbJt-94vscS2aPj9OxjeIvkDxJsfkaA9rISUzf91PM_un-I6NbM5z1LdIuI55oWA8SGXAUxONRqC-tOEZbr0Kp-q02CTKnJgdFhiUgw5_K_jApuHEXbsXy2F9MCQT3q1_3FwA1MM0DyNrnWU-hw4EP3lBPMzGWDL-O5Ei1vOphurCMoRT2kx-MJQ2tkRlCRPUvFlLTiVrKL2Hccg3N9QiipO1jPoasxAhSwybCLo64yX2hu0hZ_dxA3mulQmRTP-fclndgtA7So1P0bH_O2ZR0sQJMlI3qVGqLSQPnYpZOncJPdC9g2OR8g_LCaxqksk';
    const req = { query: { token }, get: () => {} };
    const middleware = jwtToken();

    middleware(req, undefined, () => {});

    expect(req.token).to.equal(token);
  });
});

'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const express = require('express');
const supertest = require('supertest');

const monitorRoute = require('../../../src/middleware/monitorRoute');

describe('monitor route middleware - monitorRoute.js', () => {
  const sandbox = sinon.sandbox.create();
  let stub;
  const metrics = {
    increment: () => null
  };
  const req = {
    protocol: 'https',
    method: 'GET',
    path: '/users'
  };

  beforeEach(() => {
    stub = sandbox.stub(metrics, 'increment');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('throws assertion error when metric is missing', () => {
    expect(monitorRoute).to.throw('metrics is missing');
  });

  it('throws assertion error when metric has no increment method', () => {
    expect(() => {
      monitorRoute({});
    }).to.throw('Metrics must have a "increment" method');
  });

  it('must return a function', () => {
    const middleware = monitorRoute(metrics);
    expect(middleware).to.be.instanceof(Function);
  });

  it('must call the next middle', done => {
    const middleware = monitorRoute(metrics);
    middleware(req, null, done);
  });

  it('increments the metric for the given route', done => {
    const middleware = monitorRoute(metrics);
    middleware(req, null, () => {
      expect(stub.calledOnce).to.be.equal(true);
      expect(stub.args[0]).to.be.deep.equal(['https.GET.users']);
      done();
    });
  });

  it('removes the numeric ids from the path', done => {
    const middleware = monitorRoute(metrics);
    middleware(
      Object.assign({}, req, {
        path: '/users/123456'
      }),
      null,
      () => {
        expect(stub.calledOnce).to.be.equal(true);
        expect(stub.args[0]).to.be.deep.equal(['https.GET.users_:id']);
        done();
      }
    );
  });

  it('removes the ObjectId from the path', done => {
    const middleware = monitorRoute(metrics);
    middleware(
      Object.assign({}, req, {
        path: '/users/507f1f77bcf86cd799439011'
      }),
      null,
      () => {
        expect(stub.calledOnce).to.be.equal(true);
        expect(stub.args[0]).to.be.deep.equal(['https.GET.users_:id']);
        done();
      }
    );
  });

  it('removes the flight numbers from the path', done => {
    const middleware = monitorRoute(metrics);
    middleware(
      Object.assign({}, req, {
        path: '/flight/NW1451'
      }),
      null,
      () => {
        expect(stub.calledOnce).to.be.equal(true);
        expect(stub.args[0]).to.be.deep.equal(['https.GET.flight_:id']);
        done();
      }
    );
  });

  it('removes the strings long and possibly undetected ids', done => {
    const middleware = monitorRoute(metrics);
    middleware(
      Object.assign({}, req, {
        path:
          '/users/_EjQ.xOCB-DaGVtaW4gZGVzIFl2YXJ0cywgU2FpbnQtR2VybWFpbi1sYS12aWxsZSwgRnJhbmNl/access'
      }),
      null,
      () => {
        expect(stub.calledOnce).to.be.equal(true);
        expect(stub.args[0]).to.be.deep.equal([
          'https.GET.users_:possibleid_access'
        ]);
        done();
      }
    );
  });

  it('removes all possibles ids from the path', done => {
    const middleware = monitorRoute(metrics);
    middleware(
      Object.assign({}, req, {
        path: '/drivers/123456/ride/507f1f77bcf86cd799439011'
      }),
      null,
      () => {
        expect(stub.calledOnce).to.be.equal(true);
        expect(stub.args[0]).to.be.deep.equal([
          'https.GET.drivers_:id_ride_:id'
        ]);
        done();
      }
    );
  });

  describe('express integration', () => {
    const app = express();
    const request = supertest(app);

    it('sends metrics properly with all the request stack', function* it() {
      const router = new express.Router();
      router.get('/user/:user_id', (_req, res) => {
        res.send('ok');
      });
      app.use(monitorRoute(metrics));
      app.use('/test', router);

      const { text } = yield request.get('/test/user/507f1f77bcf86cd799439011');
      expect(text).to.deep.equal('ok');

      expect(stub.calledOnce).to.be.equal(true);
      expect(stub.args[0]).to.be.deep.equal(['http.GET.test_user_:id']);
    });
  });
});

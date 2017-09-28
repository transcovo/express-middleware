'use strict';

const chai = require('chai');
const coMocha = require('co-mocha');
const mocha = require('mocha');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.use(dirtyChai);
coMocha(mocha);

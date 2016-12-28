'use strict';

module.exports = setup;

const _ = require('lodash');
const iputil = require('ip');
const rangeCheck = require('range_check');
const createError = require('http-errors');

 /**
  * testExplicitIp Test an Explicit IP against the list of constraints
  * @param  {String} ip          IP address of caller
  * @param  {String} constraints IPs to restrict or allow
  * @param  {String} isAllow        Is this allow mode
  * @return {Boolean}             True or False, if we should block or allow and matched
  */
function testExplicitIp(ip, constraints, isAllow) {
  if (ip === constraints) {
    return isAllow === true;
  }
  return isAllow === false;
}

/**
 * testCidrBlock Test an Explicit IP against a CIDR subnet mask
 * @param  {String} ip          IP address of caller
 * @param  {String} constraints IPs to restrict or allow
 * @param  {String} isAllow        Is this allow mode
 * @return {Boolean}             True or False, if we should block or allow and matched
 */
function testCidrBlock(ip, constraints, isAllow) {
  if (rangeCheck.inRange(ip, constraints)) {
    return isAllow === true;
  }
  return isAllow === false;
}

/**
 * testRange Test an Explicit IP against an IP address range
 * @param  {String} ip          IP address of caller
 * @param  {Array} constraints  This is a max and min in an Array
 * @param  {String} isAllow        Is this allow mode
 * @return {Boolean}             True or False, if we should block or allow and matched
 */
function testRange(ip, constraints, isAllow) {
  const startIp = iputil.toLong(constraints[0]);
  const endIp = iputil.toLong(constraints[1]);
  const longIp = iputil.toLong(ip);

  const withinRange = longIp >= startIp && longIp <= endIp;

  if (withinRange === true) {
    return isAllow === true;
  }

  return isAllow === false;
}

/**
 * testIp Test each constraint to see if it's a single IP address, range or block
 * @param  {String} ip          IP address of caller
 * @param  {Boolean} isAllow       Is this allow mode
 * @return {Boolean}             True or False, if we should block or allow and matched
 */
function testIp(ip, isAllow) {
  const constraint = this;

  // Check if it is an array or a string
  if (typeof constraint === 'string') {
    if (rangeCheck.validRange(constraint)) {
      return testCidrBlock(ip, constraint, isAllow);
    }
    return testExplicitIp(ip, constraint, isAllow);
  }
  /* istanbul ignore else  */
  if (typeof constraint === 'object') {
    return testRange(ip, constraint, isAllow);
  }
}

/**
 * matchClientIp Match the client IP against any of the constraints
 * @param  {Array} blockedIps     Full list of all constraints
 * @param  {String} ip          IP address of caller
 * @param  {Request} req        The HTTP request
 * @param  {Boolean} isAllow        Is this allow mode
 * @return {Boolean}             True or False, if we should block or allow and matched
 */
function matchClientIp(blockedIps, ip, req, isAllow) {
  const result = _.invokeMap(blockedIps, testIp, ip, isAllow);

  if (isAllow) {
    return _.some(result);
  }
  return _.every(result);
}

/**
 * getClientIp Get the client IP address from the incoming call
 * @param  {Request} req     The HTTP request
 * @param  {Object} options      The options for the validation, logging etc
 * @return {String}             Client IP address
 */
function getClientIp(req, options) {
  let ipAddress;

  const headerIp = _.reduce(options.allowedHeaders, (acc, header) => {
    const testIps = req.headers[header];
    /* istanbul ignore else  */
    if (testIps !== '') {
      acc = testIps;
    }

    return acc;
  });

  if (headerIp) {
    const splitHeaderIp = headerIp.split(',');
    ipAddress = splitHeaderIp[0];
  }

  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }

  if (ipAddress.indexOf(':') !== -1 && ipAddress.indexOf('::') === -1) {
    ipAddress = ipAddress.split(':')[0];
  }

  return ipAddress;
}

/**
 * Verifies if a received IP address is allowed through our system or should be rejected
 * @param  {Object} opts the middleware options
 * @return {Function} middleware
 */
function setup(opts) {
  const options = Object.assign({
    ipFilterEnabled: process.env.IP_FILTER_ENABLED === 'true',
    mode: process.env.IP_FILTER_MODE || 'deny',
    log: false,
    logger: null,
    allowedHeaders: [],
    allowPrivateIPs: false,
    excluding: []
  }, opts);

  /**
   * The middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return function middleware(req, res, next) {
    let ipList = null;
    let isAllow = false;

    // Are we configured to listen for IPs ?
    if (options.ipFilterEnabled) {
      const ip = getClientIp(req, options);
      // Split the blocked ips by a space and then determine their 'type'

      if (options.mode === 'allow') {
        isAllow = true;
        if (!process.env.IP_FILTER_ALLOWED_IPS) { return next(); }
        ipList = process.env.IP_FILTER_ALLOWED_IPS.split(' ');
      }
      if (options.mode === 'deny') {
        isAllow = false;
        if (!process.env.IP_FILTER_DENIED_IPS) { return next(); }
        ipList = process.env.IP_FILTER_DENIED_IPS.split(' ');
      }

      const blockedIps = _.map(ipList, (e) => {
        if (e.includes(',') > 0) {
          const startEnd = e.split(',');
          return [startEnd[0], startEnd[1]];
        }
        return e;
      });

      if (matchClientIp(blockedIps, ip, req, isAllow)) {
        // Grant access
        if (options.log && isAllow) {
          options.logger(`Access granted to IP address: ${ip}`);
        }

        return next();
      }

      // Deny access
      if (options.log && !isAllow) {
        options.logger(`Access denied to IP address: ${ip}`);
      }

      throw createError(401, `Access denied to IP address: ${ip}`);
    }
    next();
  };
}

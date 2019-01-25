'use strict';

const _ = require('lodash');
const createError = require('http-errors');
// ipaddr is the module used by express itself to implement its trust proxy
// http://expressjs.com/en/guide/behind-proxies.html
const ipaddr = require('ipaddr.js');

module.exports = setup;

/**
 * setup  entry point into middleware creation
 * @return {Function}        the middleware
 */
function setup() {
  const blacklistString = process.env.IP_BLACKLIST;
  if (!blacklistString) return (req, res, next) => next();

  const blacklistSet = new Set(extractIps(blacklistString));
  const isBlacklisted = function isBlackListed(ip) {
    const parsed = parseIp(ip);
    return blacklistSet.has(parsed);
  };

  return function middleware(req, res, next) {
    const ips = getReqIPs(req);
    if (ips.some(isBlacklisted)) {
      return next(createError(401, `Access denied to IP address`));
    }
    return next();
  };
}

/**
 * parseIP - get the IP address from incoming request
 * @param  {Object} rawIP raw input for IP addresses
 * @return {String}       IP address to verify
 */
function parseIp(rawIP) {
  return ipaddr.parse(rawIP).toString();
}

/**
 * extractIps Get the IP addresses from the blanklist env
 * @param  {String} rawIPs list of raw IPs
 * @return {String}        rawIP
 */
function extractIps(rawIPs) {
  return rawIPs
    ? rawIPs
        .split(',')
        .filter(_.identity)
        .map(parseIp)
    : [];
}

/**
 * getReqIPs Get IPs from incoming message, remoteAddress or forwarding
 * @param  {Request} req  incomoing message Request
 * @return {String}        rawIPs
 */
function getReqIPs(req) {
  return extractIps(req.connection.remoteAddress).concat(
    extractIps(req.get('x-forwarded-for'))
  );
}

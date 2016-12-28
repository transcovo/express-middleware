'use strict';

const _ = require('lodash');
const createError = require('http-errors');
// ipaddr is the module used by express itself to implement its trust proxy
// http://expressjs.com/en/guide/behind-proxies.html
const ipaddr = require('ipaddr.js');

module.exports = setup;

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
  }
}

function parseIp(rawIP) {
  return ipaddr.parse(rawIP).toString();
}

function extractIps(rawIPs) {
  return rawIPs ? rawIPs.split(',').filter(_.identity).map(parseIp) : [];
}

function getReqIPs(req) {
  return extractIps(req.connection.remoteAddress)
    .concat(extractIps(req.get('x-forwarded-for')));
}

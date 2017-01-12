'use strict';

const assert = require('assert');
const { get } = require('lodash');

module.exports = setup;
// // //

const PATH_REPLACE_IDS = /([\da-f]{24}|\d+)/g;
const PATH_SEPARATOR = /\/+/g;

/**
 * Extract the path slug with possible ids removed from the original path
 * @param  {Request} req Express request
 * @return {string} Route identifier
 */
function getRouteIdentifier(req) {
  const method = get(req, 'method', 'na');
  const protocol = get(req, 'protocol', 'na');
  const path = `${get(req, 'path', 'na')}`
    .substr(1)
    .replace(PATH_REPLACE_IDS, ':id')
    .replace(PATH_SEPARATOR, '_')
  ;

  return `${protocol}.${method}.${path}`;
}

/**
 * Increment the metric for the specific route
 * @param  {object}  metrics Helper to send increment metric
 * @param  {Request} req    Express request
 * @return {void}
 */
function increment(metrics, req) {
  const routeIdentifier = getRouteIdentifier(req);

  metrics.increment(routeIdentifier);
}

/**
 * Send a metric for a specific route activity
 * @param  {Object}   metrics The metric (must have a .increment method)
 * @return {Function} the middleware
 */
function setup(metrics) {
  assert.ok(metrics, 'metrics is missing');
  assert(typeof metrics.increment === 'function', 'Metrics must have a "increment" method');

  /**
   * The middleware
   * @param  {Object}   req  Express request
   * @param  {Object}   res  Express response
   * @param  {Function} next Express next handler
   * @returns {void}
   */
  return function middleware(req, res, next) {
    increment(metrics, req);
    next();
  };
}

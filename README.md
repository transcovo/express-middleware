[![Coverage Status](https://coveralls.io/repos/github/transcovo/express-middleware/badge.svg?branch=master)](https://coveralls.io/github/transcovo/express-middleware?branch=master)
[![Circle CI](https://circleci.com/gh/transcovo/express-middleware/tree/master.svg?style=shield&circle-token=97907b31816956c5736f058b30d8ef31ea0f0eaf)](https://circleci.com/gh/transcovo/express-middleware/tree/master)

## Install

```sh
npm i express-middleware --save
```

## Middlewares

- **Available**: Request Id, Child logger, JWT Token and HTTP Access logger
- **Todo**: JWT decoder, Error handler, ...

### SSL Redirect

Force SSL redirection. Options object is optional. Two possibilities to disable redirection :

- set environment variable DISABLE_SSL_REDIRECT to `true`
- add `disable`to `true` in setup options.

```js
const sslRedirect = require('express-middleware').sslRedirect;
app.use(sslRedirect(options));
```

**Middleware dependency** : _None_

### Request Id

Add or append the request id to the `req` object.

```js
const requestId = require('express-middleware').requestId;
app.use(requestId());
```

**Middleware dependency** : _None_

### Child logger

Create a child logger and append it to the `req` object. Logger must be a bunyan instance (with the method `child`).

```js
const childLogger = require('express-middleware').childLogger;
app.use(childLogger(logger));
```

**Middleware dependency** : Request Id (optional)

### JWT Token

Append the token from header or query param to the `req` object.

Query param format is `token=<mytoken>` and header format is `Authorization: Bearer <mytoken>`.

```js
const jwtToken = require('express-middleware').jwtToken;
app.use(jwtToken());
```

**Middleware dependency** : _None_

### HTTP Access logger

Log http access properties for each request (like Apache httpd) in JSON format.

```js
const httpAccessLogger = require('express-middleware').httpAccessLogger;
app.use(httpAccessLogger(opts));
```

**Middleware dependency** : Child logger (optional if options are overridden), Request Id (optional), JWT Token (optional)

### Language

Set `req.language` according to the `Accpet-Language` header

`opts.languages` is a mandatory array, it must contains at least one language.

```js
const language = require('express-middleware').language;
app.use(language(opts));
```

**Middleware dependency** : _None_

### i18n

Parse i18n data in `req.body` using `req.language` value

```js
const i18n = require('express-middleware').i18n;
app.use(i18n());
```

**Middleware dependency** : Language middleware

### IP Blacklisting

Force IP address validation before accepting a request.

- set environment variable IP_BLACKLIST to be a list of comma separated IP addresses

```js
const ipBlacklist = require('express-middleware').blacklistIPs;
app.use(ipBlacklist());
```

**Middleware dependency** : _None_

## Contribute

```sh
npm test                # start test suites (coverage + lint + mocha)
npm run coverage        # run the code coverage tool
npm run coverage-html   # run the code coverage tool with html report
npm run lint            # execute linter tool
npm run mocha           # run the tests
```

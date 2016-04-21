[![Coverage Status](https://coveralls.io/repos/github/transcovo/express-middleware/badge.svg?branch=master)](https://coveralls.io/github/transcovo/express-middleware?branch=master)
[![Circle CI](https://circleci.com/gh/transcovo/express-middleware/tree/master.svg?style=svg&circle-token=97907b31816956c5736f058b30d8ef31ea0f0eaf)](https://circleci.com/gh/transcovo/express-middleware/tree/master)

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
const sslRedirect = require('express-middlewares').sslRedirect;
app.use(sslRedirect(options));
```

**Middleware dependency** : _None_

### Request Id

Add or append the request id to the `req` object.

```js
const requestId = require('express-middlewares').requestId;
app.use(requestId());
```

**Middleware dependency** : _None_

### Child logger

Create a child logger and append it to the `req` object. Logger must be a bunyan instance (with the method `child`).

```js
const childLogger = require('express-middlewares').childLogger;
app.use(childLogger(logger));
```

**Middleware dependency** : Request Id (optional)

### JWT Token

Append the token from header or query param to the `req` object.

Query param format is `token=<mytoken>` and header format is `Authorization: Bearer <mytoken>`.  

```js
const jwtToken = require('express-middlewares').jwtToken;
app.use(jwtToken(logger));
```

**Middleware dependency** : _None_

### HTTP Access logger

Log http access properties for each request (like Apache httpd) in JSON format.

```js
const httpAccessLogger = require('express-middlewares').httpAccessLogger;
app.use(httpAccessLogger(opts));
```

**Middleware dependency** : Child logger (optional if options are overridden), Request Id (optional), JWT Token (optional)

## Contribute

```sh
npm test                # start test suites (coverage + lint + mocha)
npm run coverage        # run the code coverage tool
npm run coverage-html   # run the code coverage tool with html report
npm run lint            # execute linter tool
npm run mocha           # run the tests
```

# Express middlewares for the Chauffeur-Privé microservices

[![Coverage Status](https://coveralls.io/repos/github/transcovo/express-middlewares/badge.svg?branch=master)](https://coveralls.io/github/transcovo/express-middlewares?branch=master)
[![Circle CI](https://circleci.com/gh/transcovo/express-middlewares/tree/master.svg?style=svg)](https://circleci.com/gh/transcovo/express-middlewares/tree/master)

## Install

```sh
npm i express-middlewares --save
```
## Middlewares

### Request Id

Add or append the request id to the `req` object.

```
const requestId = require('express-middlewares').requestId;
app.use(requestId());
```

### Child logger

Create a child logger and append it to the `req` object. Logger must be a bunyan instance (with the method `child`).

```
const childLogger = require('express-middlewares').childLogger;
app.use(childLogger(logger));
```

### JWT Token

Append the token from header or query param to the `req` object.

Query param format is `token=<mytoken>` and header format is `Authorization: Bearer <mytoken>`.  

```
const jwtToken = require('express-middlewares').jwtToken;
app.use(jwtToken(logger));
```

### HTTP Access logger

Log http access properties for each request (like Apache httpd) in JSON format.

```
const httpAccessLogger = require('express-middlewares').httpAccessLogger;
app.use(httpAccessLogger(opts));
```

## Contribute

```sh
npm test                # start test suites (coverage + lint + mocha)
npm run coverage        # run the code coverage tool
npm run coverage-html   # run the code coverage tool with html report
npm run lint            # execute linter tool
npm run mocha           # run the tests
```

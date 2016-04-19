# Express middlewares for the Chauffeur-Privé microservices

[![Coverage Status](https://coveralls.io/repos/github/transcovo/express-middlewares/badge.svg?branch=master)](https://coveralls.io/github/transcovo/express-middlewares?branch=master)
[![Circle CI](https://circleci.com/gh/transcovo/express-middlewares.svg?style=svg&circle-token=97907b31816956c5736f058b30d8ef31ea0f0eaf)](https://circleci.com/gh/transcovo/express-middlewares)

## Install

```sh
npm i express-middlewares --save
```
## Middlewares

- *Available*: Request Id, Child logger, JWT Token and HTTP Access logger
- *Todo*: JWT decoder, ...

### Request Id

Add or append the request id to the `req` object.

```js
const requestId = require('express-middlewares').requestId;
app.use(requestId());
```

### Child logger

Create a child logger and append it to the `req` object. Logger must be a bunyan instance (with the method `child`).

```js
const childLogger = require('express-middlewares').childLogger;
app.use(childLogger(logger));
```

### JWT Token

Append the token from header or query param to the `req` object.

Query param format is `token=<mytoken>` and header format is `Authorization: Bearer <mytoken>`.  

```js
const jwtToken = require('express-middlewares').jwtToken;
app.use(jwtToken(logger));
```

### HTTP Access logger

Log http access properties for each request (like Apache httpd) in JSON format.

```js
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

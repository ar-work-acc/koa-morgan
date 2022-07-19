# @ts-koa/koa-morgan

HTTP request logger middleware for Koa.js.

> A TypeScript version for Koa.js, stripped down from: https://github.com/expressjs/morgan

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm i @ts-koa/koa-morgan
```

## Basic Usage:

```TypeScript
import { morgan } from "@ts-koa/koa-morgan"

const app = new Koa()
app.use(morgan())
```

## Notes

Recommended that you `.use()` this middleware near the top
to "wrap" all subsequent middleware.

## API

### morgan(format, options)

Create a new morgan logger middleware function using the given `format` and `options`.
The `format` argument may be a string of a predefined name (see below for the names) or a string of a format string.

#### Using a predefined format string:

```js
morgan("dev")
```

#### Using format string of predefined tokens:

```js
morgan(":method :url :status :res[content-length] - :response-time ms")
```

#### Options

Morgan accepts these properties in the options object.

##### logger

Output logger for writing log lines, defaults to `console.log`.  
Argument type: MorganLogger

```TypeScript
type MorganLogger = (message: any) => void
```

##### colored

A boolean that indicates whether to print out status code with colors or not. Defaults to `false`.  
If set to true, The `:status`
token will be colored green for success codes, red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for information codes.

##### skip

Function to determine if logging is skipped, defaults to `false`. This function
will be called as `skip(req, res)`.

```js
// EXAMPLE: only log error responses
morgan("combined", {
  skip: (ctx: Context) => {
    return ctx.status < 400
  },
})
```

#### Predefined Formats

There are various pre-defined formats provided:

##### combined

Standard Apache combined log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

##### common

Standard Apache common log output.

```
:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]
```

##### dev

Concise output colored by response status for development use.

```
:method :url :status :response-time ms - :res[content-length]
```

##### short

Shorter than default, also including response time.

```
:remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
```

##### tiny

The minimal output.

```
:method :url :status :res[content-length] - :response-time ms
```

### Tokens

#### :date[format]

The current date and time in UTC. The available formats are:

- `clf` for the common log format (`"10/Oct/2000:13:55:36 +0000"`)
- `iso` for the common ISO 8601 date time format (`2000-10-10T13:55:36.000Z`)
- `web` for the common RFC 1123 date time format (`Tue, 10 Oct 2000 13:55:36 GMT`)

If no format is given, then the default is `web`.

##### :http-version

The HTTP version of the request.

##### :method

The HTTP method of the request.

##### :referrer

The Referrer header of the request. This will use the standard mis-spelled Referer header if exists, otherwise Referrer.

##### :remote-addr

The remote address of the request. This will use `ctx.request.ip`, otherwise the standard `req.socket.remoteAddress` value.

##### :remote-user

The user authenticated as part of Basic auth for the request.

##### :req[header]

The given `header` of the request. If the header is not present, the
value will be displayed as `"-"` in the log.

##### :res[header]

The given `header` of the response. If the header is not present, the
value will be displayed as `"-"` in the log.

##### :response-time

The time between the request coming into `morgan` and when the response headers are written, in milliseconds.

##### :status

The status code of the response.

##### :url

The URL of the request. Uses `ctx.url`.

##### :user-agent

The contents of the User-Agent header of the request.

## Misc

Special thanks to the authors of Express.js/Morgan, as I have learned much from this simple project.  
I am glad that I started watching the whole series after it's completed. :)

## License

MIT

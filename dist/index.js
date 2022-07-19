"use strict"
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
exports.morgan = void 0
const basic_auth_1 = __importDefault(require("basic-auth"))
/**
 * Predefined logging formats.
 */
const formatMap = new Map()
// Apache combined log format.
formatMap.set(
  "combined",
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
)
// Apache common log format.
formatMap.set(
  "common",
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'
)
// Default format = combined.
formatMap.set("default", formatMap.get("combined"))
// dev format
formatMap.set(
  "dev",
  ":method :url :status :response-time ms - :res[content-length]"
)
// short format
formatMap.set(
  "short",
  ":remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
)
// tiny format
formatMap.set(
  "tiny",
  ":method :url :status :res[content-length] - :response-time ms"
)
/**
 * Helper functions section:
 */
// Pad number to two digits.
const pad2 = (num) => {
  let str = String(num)
  return `${str.length === 1 ? "0" : ""}${str}`
}
// Format a Date in the common log format.
const clfDate = (dateTime) => {
  const CLF_MONTH = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  let date = dateTime.getUTCDate()
  let hour = dateTime.getUTCHours()
  let mins = dateTime.getUTCMinutes()
  let secs = dateTime.getUTCSeconds()
  let year = dateTime.getUTCFullYear()
  let month = CLF_MONTH[dateTime.getUTCMonth()]
  return (
    pad2(date) +
    "/" +
    month +
    "/" +
    year +
    ":" +
    pad2(hour) +
    ":" +
    pad2(mins) +
    ":" +
    pad2(secs) +
    " +0000"
  )
}
// return a colored status code
const getColoredStatus = (status) => {
  let color = 0 // no color
  if (status >= 500) {
    color = 31 // red
  } else if (status >= 400) {
    color = 33 // yellow
  } else if (status >= 300) {
    color = 36 // cyan
  } else if (status >= 200) {
    color = 32 // green
  }
  return `\x1b[${color}m${status}\x1b[0m`
}
/**
 * Define how to parse format tokens here.
 * All tokens start with a colon, e.g., :\<token\>
 */
const tokenMap = new Map()
// current date
tokenMap.set("date", (ctx, format) => {
  let date = new Date()
  switch (format || "web") {
    case "clf":
      return clfDate(date)
    case "iso":
      return date.toISOString()
    case "web":
      return date.toUTCString()
  }
})
// HTTP version
tokenMap.set("http-version", (ctx, arg) => {
  return `${ctx.req.httpVersionMajor}.${ctx.req.httpVersionMinor}`
})
// request method
tokenMap.set("method", (ctx, arg) => ctx.method)
// normalized referrer
tokenMap.set("referrer", (ctx, arg) => {
  return ctx.req.headers.referer || ctx.req.headers.referrer
})
// remote address
tokenMap.set("remote-addr", (ctx, arg) => {
  const req = ctx.req
  return (
    ctx.request.ip ||
    req.socket.remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    undefined
  )
})
// remote user
tokenMap.set("remote-user", (ctx, arg) => {
  // parse basic credentials
  var credentials = (0, basic_auth_1.default)(ctx.req)
  // return username
  return credentials ? credentials.name : undefined
})
// request header
tokenMap.set("req", (ctx, arg) => {
  const header = ctx.req.headers[arg.toLowerCase()]
  return Array.isArray(header) ? header.join(", ") : header
})
// response header
tokenMap.set("res", (ctx, arg) => {
  switch (arg) {
    case "content-length":
      // TODO Koa content-length can't get retrieved from ctx.response.get...why???
      return ctx.length ?? 0
    default:
      // get header
      const header = ctx.res.getHeader(arg)
      return Array.isArray(header) ? header.join(", ") : header
  }
})
// response time in milliseconds
tokenMap.set("response-time", (ctx, arg) => {
  // TODO: only gives response time in ms now
  return `${ctx.state.responseTime}`
})
// response status code (colored or not)
tokenMap.set("status", (ctx, arg, colored = false) => {
  if (colored) {
    return getColoredStatus(ctx.status)
  } else {
    return ctx.status
  }
})
// request url
tokenMap.set("url", (ctx, arg) => ctx.url)
// user agent string
tokenMap.set("user-agent", (ctx, arg) => {
  return ctx.req.headers["user-agent"]
})
/**
 * Morgan message logger for Koa.js.
 *
 * @param format pass the format string here, or used a pre-defined format: combined(default), common, dev, short, tiny
 * @param options an options object with member logger (logger to log messages) and colored (boolean, whether to show status code in colors or not)
 * @param skip function to determine if logging is skipped, defaults to false. This function will be called as skip(ctx).
 *
 * @returns a Koa middleware to log request information
 */
const morgan = (
  format = "default",
  options = {
    logger: console.log,
    colored: true,
  }
) => {
  return async (ctx, next) => {
    // get response time in ms
    const start = Date.now()
    await next()
    ctx.state.responseTime = Date.now() - start
    // the format to use
    const parsingFormat = formatMap.has(format) ? formatMap.get(format) : format
    // check if we should skip logging
    if (!(options?.skip && options.skip(ctx))) {
      // if not skipped, log it
      const parsedLog = parsingFormat.replace(
        /:([-\w]{2,})(?:\[([^\]]+)\])?/g,
        (match, name, arg) => {
          if (name === "status" && options.colored === true) {
            return tokenMap.get("status")(ctx, arg, true)
          }
          return tokenMap.get(name)(ctx, arg)
        }
      )
      options.logger(parsedLog)
    }
  }
}
exports.morgan = morgan
//# sourceMappingURL=index.js.map

import { Context, Next } from "koa"
/**
 * Koa Morgan logger receives a function that accepts a string and prints out the content of that string.
 */
declare type MorganLogger = (message: string) => void
/**
 * Koa Morgan options.
 *
 * Supports:
 * logger: a logger to print out logs
 * colored: bool, whether to print out status code with colors or not
 * skip: a predicate to skip logging
 */
declare type MorganOptions = {
  logger: MorganLogger
  colored?: boolean
  skip?: (ctx: Context) => boolean
}
/**
 * Morgan message logger for Koa.js.
 *
 * @param format pass the format string here, or used a pre-defined format: combined(default), common, dev, short, tiny
 * @param options an options object with member logger (logger to log messages) and colored (boolean, whether to show status code in colors or not)
 * @param skip function to determine if logging is skipped, defaults to false. This function will be called as skip(ctx).
 *
 * @returns a Koa middleware to log request information
 */
declare const morgan: (
  format?: string,
  options?: MorganOptions
) => (ctx: Context, next: Next) => Promise<void>
export { morgan, MorganLogger, MorganOptions }
//# sourceMappingURL=index.d.ts.map

import winston from "winston"

export const logging = (tag: string = "jest") => {
  const logFormat = winston.format.printf(
    ({ timestamp, level, message }) =>
      `${timestamp} ${level} [${tag}]: ${message}`
  )

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      logFormat
    ),
    transports: [
      new winston.transports.Console({
        level: "debug",
        format: winston.format.combine(
          winston.format.splat(),
          winston.format.colorize()
        ),
      }),
    ],
  })

  return logger
}

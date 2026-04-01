import { createLogger, format, transports } from "winston";

const isProduction = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: "info",

  format: format.combine(
    format.timestamp(),
    isProduction ? format.json() : format.simple(),
  ),

  transports: [
    // Render captures console logs automatically
    new transports.Console({
      format: isProduction
        ? format.combine(format.timestamp(), format.json())
        : format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length
                ? JSON.stringify(meta, null, 2)
                : "";

              return `${timestamp} [${level}]: ${message} ${metaStr}`;
            }),
          ),
    }),

    // File logs only in local development
    ...(!isProduction
      ? [
          new transports.File({
            filename: "logs/error.log",
            level: "error",
          }),

          new transports.File({
            filename: "logs/combined.log",
          }),
        ]
      : []),
  ],
});

export default logger;

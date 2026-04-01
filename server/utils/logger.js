import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    // Errors only
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),

    //Write everthing(info + warn + error) to a combined file
    new transports.File({
      filename: "logs/combined.log",
    }),

    //Pretty print to terminal during dev
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        }),
      ),
    }),
  ],
});

export default logger;

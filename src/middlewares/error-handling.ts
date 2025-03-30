import { Request, Response, NextFunction } from "express";
import winston from "winston";
import path from "path";

import { CustomError } from "./CustomError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV !== "production") console.log(err);

  //If error is defined then log description, and send back message
  if (err instanceof CustomError) {
    logger.error(err.desc);
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Handle unexpected errors
  // If error is unexpected then log message, and send back custom message
  // console.error("Unexpected error:", err);
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({
    error: "Internal Server Error",
  });
  return;
};

const logDir = path.resolve(path.dirname(__filename), "../logs");

const logger = winston.createLogger({
  level: "info",
  defaultMeta: { service: "user-service" },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "errors.log") }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
    }),
  ],
});

// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     }),
//   );
// }

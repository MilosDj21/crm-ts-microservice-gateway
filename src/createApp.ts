import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";

import { errorHandler } from "./middlewares/error-handling";
import { BadRequestError } from "./middlewares/CustomError";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

export const createApp = () => {
  const clientAddress =
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_ADDRESS
      : "http://localhost:3000";

  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "./logs/access.log"),
    { flags: "a" },
  );

  const app = express();

  //middlewares
  app.use(express.json());
  app.use(
    cors({
      origin: clientAddress,
    }),
  );
  app.use(helmet());
  app.use(morgan("combined", { stream: accessLogStream }));
  app.use("/images", express.static(path.join(__dirname, "../images")));

  //routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);

  // Fallback route for non-existent endpoints
  app.use((req, res, next) => {
    next(new BadRequestError("Endpoint not found."));
  });

  //Error handler middleware must be used last, to be able to catch next(error) in controllers
  app.use(errorHandler);

  return app;
};

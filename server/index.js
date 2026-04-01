import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import weatherRoutes from "./routes/weather.js";
import geoRoutes from "./routes/geo.js";
import chatRoutes from "./routes/chat.js";
import { ZodError } from "zod";
import logger from "./utils/logger.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 31,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "You've looked at Weather for a while, it's time to touch grass",
  },
});

app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({ status: "success", message: "hello world" });
});

app.use("/api/weather", weatherRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    logger.warn("Validation Error", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      issues: err.issues,
    });
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.issues,
    });
  }

  const statusCode = err.status || 500;

  const logEntry = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    statusCode,
    stack: err.stack,
  };

  if (statusCode === 500) {
    logger.error(err.message || "Internal server error", logEntry);
  } else {
    logger.warn(err.message, logEntry);
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

app.listen(3001, () => {
  logger.info("Server running on http://localhost:3001");
});

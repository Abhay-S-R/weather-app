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

app.set("trust proxy", true);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    }
    next();
  });
}

app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    error: "You've looked at Weather for a while, it's time to touch grass",
  },
  handler: (req, res, next, options) => {
    logger.warn("Rate limit exceeded", {
      method: req.method,
      ip: req.ip,
      url: req.originalUrl,
    });
    res.status(options.statusCode).json(options.message);
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

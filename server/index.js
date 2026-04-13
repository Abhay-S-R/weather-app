import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
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

app.get("/", (req, res) => {
  res.json({ status: "success", message: "hello world" });
});

app.use("/api/weather", weatherRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/chat", chatRoutes);
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

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

  if (statusCode === 429 || statusCode >= 500) {
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

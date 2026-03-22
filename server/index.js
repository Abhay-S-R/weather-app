import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import weatherRoutes from "./routes/weather.js";
import geoRoutes from "./routes/geo.js";
import chatRoutes from "./routes/chat.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
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
  const statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error("CRITICAL CRASH:", err.stack);
  }
  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error"
  });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});

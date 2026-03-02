import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import weatherRoutes from "./routes/weather.js";
import geoRoutes from "./routes/geo.js";
import chatRoutes from "./routes/chat.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({ status: "success", message: "hello world" });
});

app.use("/api/weather", weatherRoutes);
app.use("/api/geo", geoRoutes);
app.use("/api/chat", chatRoutes);

app.use((err, req, res, next) => {
    console.err(err.stack);
    res.status(500).json({error: "Internal Server Error"})
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
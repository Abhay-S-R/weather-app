import express from "express";
import { cacheSet, cacheGet } from "../utils/cache.js";

const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const TTL = 10 * 60 * 1000; //10mins in ms

router.get("/", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "lat and lon must be numbers" });
  }

  try {
    const latNum = parseFloat(lat).toFixed(3);
    const lonNum = parseFloat(lon).toFixed(3);
    const key = `weather:${latNum}:${lonNum}`;
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch weather data" });
    }

    const data = await response.json();
    cacheSet(key, data, TTL);
    res.json(data);
  } catch (err) {
    console.error("Weather route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

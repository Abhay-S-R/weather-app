import express from "express";
import { cacheSet, cacheGet } from "../utils/cache.js";
import { z } from "zod";

const weatherSchema = z.object({
  lat: z.string(),
  lon: z.string(),
});

const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const TTL = 10 * 60 * 1000; //10mins in ms

router.get("/", async (req, res, next) => {
  try {
    const validatedData = weatherSchema.parse(req.query);
    const { lat, lon } = validatedData;

    const latNum = parseFloat(lat).toFixed(3);
    const lonNum = parseFloat(lon).toFixed(3);
    const key = `weather:${latNum}:${lonNum}`;
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      const err = new Error("Failed to fetch weather data");
      err.status = 502;
      throw err;
    }

    const data = await response.json();
    cacheSet(key, data, TTL);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;

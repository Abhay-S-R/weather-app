import express from "express";
import { cacheSet, cacheGet } from "../utils/cache.js";
import { z } from "zod";

const geoDirectSchema = z.object({
  q: z.string(),
  l: z.coerce.number().int().optional().default(1),
});

const geoReverseSchema = z.object({
  lat: z.string(),
  lon: z.string(),
});

const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error("FATAL: OPENWEATHER_API_KEY is not set");
  process.exit(1);
}

router.get("/direct", async (req, res, next) => {
  try {
    const validatedData = geoDirectSchema.parse(req.query);
    const { q, limit = 1 } = validatedData;

    const TTL = 24 * 60 * 60 * 1000;
    const normalizedQ = q.trim().toLowerCase();
    const key = `geo:direct:${normalizedQ}:${limit}`;
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      const err = new Error("Failed to fetch geo data");
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

router.get("/reverse", async (req, res, next) => {
  try {
    const validatedData = geoReverseSchema.parse(req.query);
    const { lat, lon } = validatedData;

    const TTL = 24 * 60 * 60 * 1000;
    const latNum = parseFloat(lat).toFixed(3);
    const lonNum = parseFloat(lon).toFixed(3);
    const key = `geo:reverse:${latNum}:${lonNum}`;
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      const err = new Error("Failed to fetch geo data");
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

router.get("/ip", async (req, res, next) => {
  try {
    const TTL = 10 * 60 * 60 * 1000;

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    if (!clientIp) {
      return res.status(400).json({ error: "Unable to determine client IP" });
    }

    const key = `geo:ip:${clientIp}`;
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    let url;
    if (clientIp === "::1" || clientIp.includes("127.0.0.1")) {
      url = "https://get.geojs.io/v1/ip/geo.json";
    } else {
      url = `https://get.geojs.io/v1/ip/geo/${clientIp}.json`;
    }
    const response = await fetch(url);

    if (!response.ok) {
      const err = new Error("Failed to fetch IP geolocation");
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

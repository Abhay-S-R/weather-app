import express from "express";
const router = express.Router();

const API_KEY = process.env.OPENWEATHER_API_KEY;

router.get("/direct", async (req, res) => {
  const { q, limit = 1 } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ error: "q (city name) is required" });
  }

  try {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch geo data" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Geo direct route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "lat and lon must be numbers" });
  }

  try {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch geodata" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Geo reverse route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/ip", async (req, res, next) => {
  try {
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    if (!clientIp) {
      return res.status(400).json({ error: "Unable to determine client IP" });
    }

    let url;
    if (clientIp === "::1" || clientIp.includes("127.0.0.1")) {
      url = "https://get.geojs.io/v1/ip/geo.json";
    } else {
      url = `https://get.geojs.io/v1/ip/geo/${clientIp}.json`;
    }
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch IP geolocation" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;

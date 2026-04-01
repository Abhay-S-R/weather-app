import express from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import logger from "../utils/logger.js";

const chatObjectSchema = z.object({
  city: z.string().min(1, "City name is required").max(100),
  weatherData: z.any(),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string(),
      }),
    )
    .optional(),
});

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 21,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  message: {
    error:
      "Maybe it's time for my cute little weather assistant to take rest, it wil be back after 1 hour",
  },
  handler: (req, res, next, options) => {
    logger.warn("Rate limit exceeded", {
      method: req.method,
      ip:req.ip,
      url: req.originalUrl
    });
    res.status(options.statusCode).json(options.message);
  }
});
// Replicate toLocalTime from client utils (everything in ms)
function toLocalTime(unixTime, timeMilliSecs) {
  const date = new Date(unixTime + timeMilliSecs);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const mins = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${mins}`;
}

function buildSystemInstruction(city, weatherData) {
  const localTime = toLocalTime(Date.now(), weatherData.timeSecs * 1000);

  const context = {
    localTime,
    timeZone: weatherData.timeZone,
    temperature: weatherData.temp,
    tempMax: weatherData.temp_max,
    tempMin: weatherData.temp_min,
    feelsLike: weatherData.feelsLike,
    description: weatherData.description,
    humidity: weatherData.humidity,
    windSpeed: weatherData.windSpeed,
    windGust: weatherData.windGust,
    visibility: weatherData.visibility,
    cloudiness: weatherData.cloudiness,
    pressure: weatherData.pressure,
    sunrise: weatherData.sunrise,
    sunset: weatherData.sunset,
  };

  return [
    `You are a friendly, knowledgeable weather assistant for ${city}.`,
    `Current weather: ${JSON.stringify(context)}`,
    "Temps in °C, wind in m/s, visibility in meters.",
    "Greet the user based on the city's local time (Good morning/afternoon/evening).",
    "Greet them at the start only, dont greet them in every response.",
    "Keep responses concise (3-5 sentences). Be specific with clothing/activity advice.",
    "Use a warm tone with occasional weather emoji.",
    "Stay on weather topics. Gently steer away if the user prompts for something else.",
    "If the user asks for weather in a different city, prompt them to use the search bar to find the weather for that city.",
    "If the user consecutively for 3 times asks about different topics other than the weather, jokingly say that you will leak the user's current location to weather API provider and they can use that train their AI models.",
    "Give a dramatic pause and say it was just a joke and clarify that the location or search history won't be shared with anyone.",
    "If the user asks about something else for 4 or more times, just say 'I'm only here to talk about weather' and nothing else.",
  ].join("\n");
}

router.post("/", strictLimiter, async (req, res, next) => {
  try {
    const validatedData = chatObjectSchema.parse(req.body);
    const  {city, weatherData, history, message} = validatedData;

    const systemInstruction = buildSystemInstruction(city, weatherData);

    // Map frontend message history to Gemini's expected format
    const contents = (history || []).slice(-10).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    // Append the new user message
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      config: { systemInstruction },
      contents,
    });

    res.json({ reply: response.text });
  } catch (err) {
    next(err);
  }
});

export default router;

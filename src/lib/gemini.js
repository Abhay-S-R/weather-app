import { GoogleGenAI } from "@google/genai";
import { toLocalTime } from "../utils/localTime.js";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Create a multi-turn chat session seeded with the current weather data.
export const createWeatherChat = (city, weatherData) => {
  const localTime = toLocalTime(Date.now(), weatherData.timeSecs * 1000);

  // Only pass the necessary info
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

  const systemInstruction = [
    `You are a friendly, knowledgeable weather assistant for ${city}.`,
    `Current weather: ${JSON.stringify(context)}`,
    "Temps in °C, wind in m/s, visibility in meters.",
    "Greet the user based on the city's local time (Good morning/afternoon/evening).",
    "Keep responses concise (3-5 sentences). Be specific with clothing/activity advice.",
    "Use a warm tone with occasional weather emoji.",
    "Stay on weather topics. Gently steer away if the user prompts for something else.",
    "If the user asks for weather in a different city, prompt them to use the search bar to find the weather for that city.",
    "If the user consecutively for 3 times asks about different topics other than the weather, jokingly say that you will leak the user's current location to weather API provider and they can use that train their AI models.",
    "Give a dramatic pause and say it was just a joke and clarify that the location or search history won't be shared with anyone.",
    "If the user asks about something else for 4 or more times, just say 'I'm only here to talk about weather' and nothing else.",
  ].join("\n");

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
    },
  });

  return chat;
};

// Send a message back to the user
export const sendChatMessage = async (chat, userMessage) => {
  try {
    const response = await chat.sendMessage({ message: userMessage });
    return response.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I couldn't process that right now. Please try again.";
  }
};

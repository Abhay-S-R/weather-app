import { buildWeatherData } from "../utils/buildWeatherData";
import { API_BASE } from "../config/api";

//All API responses are in seconds

//WeatherAPI
export const fetchWeatherData = async (
  lat,
  lon,
  name,
  state,
  country,
  signal,
) => {
  const weatherResponse = await fetch(`${API_BASE}/api/weather?lat=${lat}&lon=${lon}`, {
    signal: signal,
  });
  
  const data = await weatherResponse.json().catch(() => ({}));
  if (!weatherResponse.ok) {
    if (weatherResponse.status === 429) {
      throw new Error(data.error);
    }
    console.error(`Backend Error (${weatherResponse.status}):`, data);
    throw new Error("Failed to fetch weather data");
  }

  return buildWeatherData(data, name, state, country);
};

//GeoCoding API - direct
export const fetchGeoData = async (query, limit = 1, signal) => {
  const geoResponse = await fetch(
    `${API_BASE}/api/geo/direct?q=${encodeURIComponent(query)}&limit=${limit}`,
    { signal: signal },
  );

  const geoData = await geoResponse.json().catch(() => ({}));
  if (!geoResponse.ok) {
    if (geoResponse.status === 429) {
      throw new Error(geoData.error);
    }
    console.error(`Backend Error (${geoResponse.status}):`, geoData);
    throw new Error("Failed to fetch geo data");
  }

  return { geoData };
};

//GeoCoding API - reverse
export const fetchReverseGeoData = async (lat, lon, signal) => {
  const geoResponse = await fetch(`${API_BASE}/api/geo/reverse?lat=${lat}&lon=${lon}`, {
    signal: signal,
  });

  const geoData = await geoResponse.json().catch(() => ({}));
  if (!geoResponse.ok) {
    if (geoResponse.status === 429) {
      throw new Error(geoData.error);
    }
    console.error(`Backend Error (${geoResponse.status}):`, geoData);
    throw new Error("Failed to fetch reverse geo data");
  }

  return { geoResponse, geoData };
};

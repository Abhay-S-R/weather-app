import { buildWeatherData } from "../utils/buildWeatherData";

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
  const weatherResponse = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
    signal: signal,
  });
  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather data");
  }
  const data = await weatherResponse.json();
  return buildWeatherData(data, name, state, country);
};

//GeoCoding API - direct
export const fetchGeoData = async (query, limit = 1, signal) => {
  const geoResponse = await fetch(
    `/api/geo/direct?q=${encodeURIComponent(query)}&limit=${limit}`,
    { signal: signal },
  );
  const geoData = await geoResponse.json();
  return { geoResponse, geoData };
};

//GeoCoding API - reverse
export const fetchReverseGeoData = async (lat, lon, signal) => {
  const geoResponse = await fetch(`/api/geo/reverse?lat=${lat}&lon=${lon}`, {
    signal: signal,
  });
  const geoData = await geoResponse.json();
  return { geoResponse, geoData };
};

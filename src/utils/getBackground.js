// Maps OpenWeatherMap icon codes to beautiful Unsplash background images.
// Icon format: "XXd" or "XXn" where d=day, n=night.
//
// All photo IDs have been verified to return HTTP 200 from images.unsplash.com.
// We use ?w=1920&q=80&fit=crop&auto=format for optimized full-screen backgrounds.

const UNSPLASH = "https://images.unsplash.com";
const PARAMS = "?w=1920&q=80&fit=crop&auto=format";

const backgrounds = {
  // Clear sky — day (golden field landscape)
  clear_day: `${UNSPLASH}/photo-1500382017468-9049fed747ef${PARAMS}`,
  // Clear sky — night (starry mountain sky)
  clear_night: `${UNSPLASH}/photo-1519681393784-d120267933ba${PARAMS}`,
  // Cloudy — day (overcast sky over landscape)
  cloudy_day: `${UNSPLASH}/photo-1501630834273-4b5604d2ee31${PARAMS}`,
  // Cloudy — night (dramatic dark clouds)
  cloudy_night: `${UNSPLASH}/photo-1499956827185-0d63ee78a910${PARAMS}`,
  // Rain — day (rainy landscape)
  rain_day: `${UNSPLASH}/photo-1428592953211-077aa0277730${PARAMS}`,
  // Rain — night (rainy city night)
  rain_night: `${UNSPLASH}/photo-1493314894560-5c412a56c17c${PARAMS}`,
  // Thunderstorm (dramatic lightning)
  thunderstorm: `${UNSPLASH}/photo-1472145246862-b24cf25c4a36${PARAMS}`,
  // Snow — day (snowy forest)
  snow_day: `${UNSPLASH}/photo-1478265409131-1f65c88f965c${PARAMS}`,
  // Snow — night (snowy trees)
  snow_night: `${UNSPLASH}/photo-1517299321609-52687d1bc55a${PARAMS}`,
  // Mist / Fog — day (misty mountains)
  mist_day: `${UNSPLASH}/photo-1543968996-ee822b8176ba${PARAMS}`,
  // Mist / Fog — night (foggy forest)
  mist_night: `${UNSPLASH}/photo-1485236715568-ddc5ee6ca227${PARAMS}`,
};

// OpenWeatherMap icon code → background key
const iconToBackground = {
  "01d": "clear_day",
  "01n": "clear_night",
  "02d": "clear_day",
  "02n": "clear_night",
  "03d": "cloudy_day",
  "03n": "cloudy_night",
  "04d": "cloudy_day",
  "04n": "cloudy_night",
  "09d": "rain_day",
  "09n": "rain_night",
  "10d": "rain_day",
  "10n": "rain_night",
  "11d": "thunderstorm",
  "11n": "thunderstorm",
  "13d": "snow_day",
  "13n": "snow_night",
  "50d": "mist_day",
  "50n": "mist_night",
};

/**
 * Returns the Unsplash background image URL for a given weather icon code.
 * @param {string} icon - OpenWeatherMap icon code (e.g. "01d", "10n")
 * @returns {string|null} Background image URL, or null if no match
 */
export function getBackground(icon) {
  if (!icon) return null;
  const key = iconToBackground[icon];
  return key ? backgrounds[key] : null;
}

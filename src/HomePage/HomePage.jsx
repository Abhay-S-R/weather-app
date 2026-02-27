import "./HomePage.css";
import { useState, useEffect, useRef } from "react";
import WeatherDisplay from "../components/WeatherDisplay";
import ChatPanel from "../components/ChatPanel";
import { buildWeatherData } from "../utils/buildWeatherData.js";
import { getBackground } from "../utils/getBackground.js";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

//All API responses are in seconds

//WeatherAPI
const fetchWeatherData = async (lat, lon, name, state, country) => {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) {
    throw new Error("Failed to fetch weather data");
  }
  const data = await weatherResponse.json();
  return buildWeatherData(data, name, state, country);
};

//GeoCoding API
const fetchGeoData = async (query, limit = 1) => {
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=${limit}&appid=${API_KEY}`;
  const geoResponse = await fetch(geoUrl);
  const geoData = await geoResponse.json();
  return { geoResponse, geoData };
};

function HomePage() {
  const [locInput, setLocInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("weather-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (weather) {
      setSearchHistory((prev) => {
        // Deduplicate by city + country
        const filtered = prev.filter(
          (h) => !(h.city === weather.city && h.country === weather.country),
        );

        const updatedHistory = [...filtered.slice(-4), weather];
        localStorage.setItem("weather-history", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }
  }, [weather]);

  // Debounced suggestions fetch
  useEffect(() => {
    if (locInput.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    // User is typing 3+ chars — hide history, show suggestions
    setShowHistory(false);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(locInput);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [locInput]);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      const { geoData } = await fetchGeoData(query, 5);

      if (geoData.length > 0) {
        setSuggestions(geoData);
        setShowSuggestions(true);
        setShowHistory(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fetch weather using lat/lon directly (used by suggestion clicks, not directly by user)
  const fetchWeatherByCoords = async (suggestion) => {
    setError(null);
    setWeather(null);
    setLoading(true);
    setShowSuggestions(false);
    setLocInput("");
    setSuggestions([]);
    inputRef.current?.blur();
    setShowHistory(false);

    try {
      const { lat, lon, name, state, country } = suggestion;
      const weatherData = await fetchWeatherData(
        lat,
        lon,
        name,
        state,
        country,
      );
      setWeather(weatherData);
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Text-based search
  const textSearch = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setWeather(null);
    setLoading(true);
    setShowSuggestions(false);
    setSuggestions([]);

    try {
      const { geoResponse, geoData } = await fetchGeoData(city);
      if (!geoResponse.ok) throw new Error("Failed to fetch geo data");
      if (geoData.length === 0) throw new Error("City not found");

      const { lat, lon, name, state, country } = geoData[0];
      const weatherData = await fetchWeatherData(
        lat,
        lon,
        name,
        state,
        country,
      );
      setWeather(weatherData);
      setLocInput("");
      inputRef.current?.blur();
      setShowHistory(false);
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
    }
  };

  const bgUrl = getBackground(weather?.icon);

  return (
    <>
      <div
        className={`weather-bg ${bgUrl ? "active" : ""}`}
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : {}}
      />
      <header className="app-header">
        <h1 className="app-title">Havāmāna</h1>
        <p className="app-subtitle">Real-time weather, anywhere in the world</p>
      </header>

      <div className="search-wrapper" ref={dropdownRef}>
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            className="location-input"
            placeholder="Search for a city..."
            value={locInput}
            onChange={(e) => {
              setLocInput(e.target.value);
              if (e.target.value.length > 0) {
                setShowHistory(false);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && textSearch(locInput)}
            onFocus={() => {
              if (locInput.length === 0 && searchHistory.length > 0) {
                setShowHistory(true);
                setShowSuggestions(false);
              } else if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            disabled={loading}
          />
          <button
            className="location-enter-btn"
            onClick={() => textSearch(locInput)}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((s, idx) => (
              <li
                key={`${s.lat}-${s.lon}-${idx}`}
                className="suggestion-item"
                onClick={() => fetchWeatherByCoords(s)}
              >
                <span className="suggestion-name">{s.name}</span>
                <span className="suggestion-meta">
                  {[s.state, s.country].filter(Boolean).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {showHistory && !showSuggestions && searchHistory.length > 0 && (
          <ul className="suggestions-list history-list">
            <li className="history-header">
              <span>Recent searches</span>
              <button
                className="clear-history-btn"
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem("weather-history");
                  setShowHistory(false);
                }}
              >
                Clear
              </button>
            </li>
            {[...searchHistory].reverse().map((h, idx) => (
              <li
                key={`${h.city}-${h.country}-${idx}`}
                className="suggestion-item history-item"
                onClick={() => {
                  setShowHistory(false);
                  const query = [h.city, h.state, h.country]
                    .filter(Boolean)
                    .join(", ");
                  textSearch(query);
                }}
              >
                <span className="suggestion-name">🕐 {h.city}</span>
                <span className="suggestion-meta">
                  {[h.state, h.country].filter(Boolean).join(", ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Loading weather data...</p>
        </div>
      )}

      <WeatherDisplay weather={weather} />
      <ChatPanel weather={weather} />
    </>
  );
}

export default HomePage;

import "./HomePage.css";
import { useState, useEffect, useRef } from "react";
import WeatherDisplay from "../components/WeatherDisplay";
import { buildWeatherData } from "../utils/buildWeatherData.js";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

//All API responses are in seconds

function HomePage() {
  const [locInput, setLocInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const inputBlurRef = useRef(null);

  const [saveHistory, setSaveHistory] = useState(() => {
    const saved = localStorage.getItem("weather-history");
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (weather) {
      setSaveHistory((prev) => {
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
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

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
    inputBlurRef.current?.blur();
    setShowHistory(false);

    try {
      const { lat, lon, name, state, country } = suggestion;

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const data = await weatherResponse.json();
      const weatherData = buildWeatherData(data, name, state, country);
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
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoResponse.ok) throw new Error("Failed to fetch geo data");
      if (geoData.length === 0) throw new Error("City not found");

      const { lat, lon, name, state, country } = geoData[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      const weatherResponse = await fetch(weatherUrl);

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404)
          throw new Error("City not found please try again");
        else throw new Error("Failed to fetch weather data");
      }

      const data = await weatherResponse.json();
      const weatherData = buildWeatherData(data, name, state, country);
      setWeather(weatherData);
      setLocInput("");
      inputBlurRef.current?.blur();
      setShowHistory(false);
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Havāmāna</h1>
        <p className="app-subtitle">Real-time weather, anywhere in the world</p>
      </header>

      <div className="search-wrapper" ref={dropdownRef}>
        <div className="input-container">
          <input
            ref={inputBlurRef}
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
              if (locInput.length === 0 && saveHistory.length > 0) {
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

        {showHistory && !showSuggestions && saveHistory.length > 0 && (
          <ul className="suggestions-list history-list">
            <li className="history-header">
              <span>Recent searches</span>
              <button
                className="clear-history-btn"
                onClick={() => {
                  setSaveHistory([]);
                  localStorage.removeItem("weather-history");
                  setShowHistory(false);
                }}
              >
                Clear
              </button>
            </li>
            {[...saveHistory].reverse().map((h, idx) => (
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
    </>
  );
}

export default HomePage;

import "./HomePage.css";
import { useState, useEffect, useRef } from "react";
import WeatherDisplay from "../components/WeatherDisplay";
import { buildWeatherData } from "../utils/buildWeatherData.js";

//All API responses are in seconds

function HomePage() {
  const [locInput, setLocInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced suggestions fetch
  useEffect(() => {
    if (locInput.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

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
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (geoData.length > 0) {
        setSuggestions(geoData);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Fetch weather using lat/lon directly (used by suggestion clicks)
  const fetchWeatherByCoords = async (suggestion) => {
    setError(null);
    setWeather(null);
    setLoading(true);
    setShowDropdown(false);
    setLocInput("");
    setSuggestions([]);

    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const { lat, lon, name, state, country } = suggestion;

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
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
  const handleSearch = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setWeather(null);
    setLoading(true);
    setShowDropdown(false);
    setSuggestions([]);

    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoResponse.ok) throw new Error("Failed to fetch geo data");
      if (geoData.length === 0) throw new Error("City not found");

      const { lat, lon, name, state, country } = geoData[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
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
            type="text"
            className="location-input"
            placeholder="Search for a city..."
            value={locInput}
            onChange={(e) => setLocInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(locInput)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            disabled={loading}
          />
          <button
            className="location-enter-btn"
            onClick={() => handleSearch(locInput)}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {showDropdown && suggestions.length > 0 && (
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

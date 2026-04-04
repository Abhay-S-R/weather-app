import "./HomePage.css";
import SearchBar from "../components/SearchBar";
import WeatherDisplay from "../components/WeatherDisplay";
import ChatPanel from "../components/ChatPanel";
import useWeather from "../hooks/useWeather.js";
import useSearchHistory from "../hooks/useSearchHistory.js";
import ErrorBoundary from "../components/ErrorBoundary/index.js";
import WeatherSkeleton from "../components/WeatherSkeleton";
import { useCallback } from "react";

function HomePage() {
  const {
    weather,
    loading,
    error,
    transitioning,
    prevBgUrl,
    setPrevBgUrl,
    bgUrl,
    searchByCoords,
    searchByCity,
    getCurrentLocation,
    setError, // Good practice to have setError even if it's unused
  } = useWeather();

  const { searchHistory, clearHistory } = useSearchHistory(weather);

  // Cache both the functions as it need not re-render with every keyboard stroke on the search bar
  const handleSearch = useCallback(
    (city) => searchByCity(city),
    [searchByCity],
  );
  const handleSelectSuggestion = useCallback(
    (s) => searchByCoords(s.lat, s.lon, s.name, s.state, s.country),
    [searchByCoords],
  );

  return (
    <>
      {/* Previous background for crossfade */}
      {prevBgUrl && prevBgUrl !== bgUrl && (
        <div
          className="weather-bg active"
          style={{ backgroundImage: `url(${prevBgUrl})` }}
        />
      )}
      <div
        className={`weather-bg ${bgUrl ? "active" : ""}`}
        style={bgUrl ? { backgroundImage: `url(${bgUrl})` } : {}}
        onTransitionEnd={() => setPrevBgUrl(null)}
      />
      <header className="app-header">
        <h1 className="app-title">Havāmāna</h1>
        <p className="app-subtitle">Real-time weather, anywhere in the world</p>
      </header>

      <SearchBar
        onSearch={handleSearch}
        onSelectSuggestion={handleSelectSuggestion}
        onGetCurrentLocation={getCurrentLocation}
        searchHistory={searchHistory}
        clearHistory={clearHistory}
        loading={loading}
      />

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && <WeatherSkeleton />}
      {!loading && (
        <div
          className={`weather-content ${transitioning ? "transitioning" : ""}`}
        >
          <ErrorBoundary>
            <WeatherDisplay weather={weather} />
          </ErrorBoundary>
          <ErrorBoundary>
            <ChatPanel weather={weather} />
          </ErrorBoundary>
        </div>
      )}
    </>
  );
}

export default HomePage;

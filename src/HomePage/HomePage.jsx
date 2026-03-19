import "./HomePage.css";
import SearchBar from "../components/SearchBar";
import WeatherDisplay from "../components/WeatherDisplay";
import ChatPanel from "../components/ChatPanel";
import useWeather from "../hooks/useWeather.js";
import useSearchHistory from "../hooks/useSearchHistory.js";

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
    setError,
  } = useWeather();

  const { searchHistory, clearHistory } = useSearchHistory(weather);

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
        onSearch={(city) => searchByCity(city)}
        onSelectSuggestion={(s) =>
          searchByCoords(s.lat, s.lon, s.name, s.state, s.country)
        }
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

      {loading && (
        <div className="loading">
          <p>Loading weather data...</p>
        </div>
      )}

      <div
        className={`weather-content ${transitioning ? "transitioning" : ""}`}
      >
        <WeatherDisplay weather={weather} />
        <ChatPanel weather={weather} />
      </div>
    </>
  );
}

export default HomePage;

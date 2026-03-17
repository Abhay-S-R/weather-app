import { useState, useEffect } from "react";

function useSearchHistory(weather) {
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("weather-history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (weather) {
      setSearchHistory((prev) => {
        const filtered = prev.filter(
          (h) => !(h.city === weather.city && h.country === weather.country),
        );
        const updatedHistory = [...filtered.slice(-4), weather];
        localStorage.setItem("weather-history", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }
  }, [weather]);

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("weather-history");
  };

  return { searchHistory, clearHistory };
}

export default useSearchHistory;

import { useState, useEffect } from "react";
import { preloadImg } from "../utils/preLoadImg";
import { fetchWeatherData, fetchGeoData, fetchReverseGeoData } from "../services/weatherApi";
import { getBackground } from "../utils/getBackground";

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [prevBgUrl, setPrevBgUrl] = useState(null);

  // IP based search
  useEffect(() => {
    const controller = new AbortController();

    const getIpData = async () => {
      try {
        const ipData = await fetch("/api/geo/ip", {
          signal: controller.signal,
        }).then((res) => res.json());

        const weatherData = await fetchWeatherData(
          parseFloat(ipData.latitude),
          parseFloat(ipData.longitude),
          ipData.city,
          ipData.region,
          ipData.country_code,
          controller.signal,
        );
        setWeather(weatherData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch IP data", err);
        }
      }
    };

    getIpData();

    return () => {
      controller.abort();
    };
  }, []);

  const searchByCoords = async (lat, lon, name, state, country) => {
    setError(null);
    setLoading(true);
    setTransitioning(true);

    try {
      const weatherData = await fetchWeatherData(
        lat,
        lon,
        name,
        state,
        country,
      );

      const newBgUrl = getBackground(weatherData.icon);
      await preloadImg(newBgUrl);

      setPrevBgUrl(getBackground(weather?.icon));
      setWeather(weatherData);
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
      setTimeout(() => setTransitioning(false), 400);
    }
  };

  const searchByCity = async (city) => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setError(null);
    setLoading(true);
    setTransitioning(true);

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

      const newBgUrl = getBackground(weatherData.icon);
      await preloadImg(newBgUrl);

      setPrevBgUrl(getBackground(weather?.icon));
      setWeather(weatherData);
    } catch (err) {
      setError(err.message);
      console.error("error: ", err);
    } finally {
      setLoading(false);
      setTimeout(() => setTransitioning(false), 400);
    }
  };

  //Current-location based search
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // reverse geocode to get city name from coords
          const { geoData } = await fetchReverseGeoData(latitude, longitude);
          if (geoData.length === 0)
            throw new Error("Could not determine your city");

          const { name, state, country } = geoData[0];
          const weatherData = await fetchWeatherData(
            latitude,
            longitude,
            name,
            state,
            country,
          );
          const newBgUrl = getBackground(weatherData.icon);
          await preloadImg(newBgUrl);

          setPrevBgUrl(getBackground(weather?.icon));
          setWeather(weatherData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setError("Location access denied — please enable location permissions");
        console.error(err);
      },
    );
  };

  const bgUrl = getBackground(weather?.icon);

  return {
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
  };
}

export default useWeather;

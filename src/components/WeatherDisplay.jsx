function WeatherDisplay({weather}){
    if(!weather) return null;

    return (
    <div className="weather-display">
      <h2>{weather.city}</h2>
      <p className="temperature">{weather.temp}°C</p>
      <p className="description">{weather.description}</p>
      <p className="feels-like">Feels like: {weather.feelsLike}°C</p>
      <p className="humidity">Humidity: {weather.humidity}%</p>
    </div>
  );
}

export default WeatherDisplay;
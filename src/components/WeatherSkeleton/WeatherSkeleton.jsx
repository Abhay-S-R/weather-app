import "./WeatherSkeleton.css";

function WeatherSkeleton() {
  return (
    <div className="weather-skeleton" aria-hidden="true">
      <div className="skeleton city-name-skeleton"></div>

      <div className="weather-hero-skeleton">
        <div className="skeleton icon-skeleton"></div>
        <div className="skeleton temp-skeleton"></div>
      </div>

      <div className="skeleton description-skeleton"></div>

      <div className="toggle-buttons-skeleton">
        <div className="skeleton button-skeleton"></div>
        <div className="skeleton button-skeleton"></div>
      </div>

      <div className="weather-details-grid-skeleton">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="skeleton detail-item-skeleton"></div>
        ))}
      </div>

      <div className="wind-widget-skeleton">
        <div className="skeleton wind-header-skeleton"></div>
        <div className="wind-body-skeleton">
          <div className="skeleton wind-arrow-skeleton"></div>
          <div className="wind-speed-skeleton-group">
            <div className="skeleton wind-speed-skeleton"></div>
            <div className="skeleton wind-label-skeleton"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherSkeleton;

import {
  FaSun,
  FaWind,
  FaUmbrella,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

export default function WeatherDetails({ weather }) {
  return (
    <>
      <div className="detail-item">
        <FaSun style={{ color: '#FFA500', fontSize: '1.5rem' }} />
        <div>
          <h4>Temperature</h4>
          <p>{weather.temperature}°C (Feels like {weather.feelsLike}°C)</p>
        </div>
      </div>

      <div className="detail-item">
        <FaWind style={{ color: '#4682B4', fontSize: '1.5rem' }} />
        <div>
          <h4>Wind</h4>
          <p>{weather.windSpeed} km/h</p>
        </div>
      </div>

      <div className="detail-item">
        <FaUmbrella style={{ color: '#4682B4', fontSize: '1.5rem' }} />
        <div>
          <h4>Humidity</h4>
          <p>{weather.humidity}%</p>
        </div>
      </div>

      <div className="detail-item">
        <FaArrowUp style={{ color: '#FFA500', fontSize: '1.5rem' }} />
        <div>
          <h4>Sunrise</h4>
          <p>{weather.sunrise}</p>
        </div>
      </div>

      <div className="detail-item">
        <FaArrowDown style={{ color: '#FF6347', fontSize: '1.5rem' }} />
        <div>
          <h4>Sunset</h4>
          <p>{weather.sunset}</p>
        </div>
      </div>
    </>
  );
}
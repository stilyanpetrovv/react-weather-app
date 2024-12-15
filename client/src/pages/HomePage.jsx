import { useState } from 'react';
import './HomePage.css';


const HomePage = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  // Fetch weather data
  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await response.json();
      if (data.current_weather) {
        setWeather(data.current_weather);
      } else {
        setError('Weather data not available.');
      }
    } catch (err) {
      setError('Failed to fetch weather data.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setWeather(null);
    setError('');

    try {
      const geocodingResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${city}&format=json`
      );
      const geocodingData = await geocodingResponse.json();

      if (!city.trim()) {
        setError('City name cannot be empty!');
        return;
      }

      if (geocodingData.length > 0) {
        const { lat, lon } = geocodingData[0];
        fetchWeather(lat, lon);
      } else {
        setError('City not found.');
      }
    } catch (err) {
      setError('Failed to fetch city coordinates.');
    }
  };

  return (
    <div className="wrapper">
      <h2>Weather App</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
        />
      {error && <p className="error">{error}</p>}
      <button type="submit">Get Weather</button>
      </form>

      {weather && (
        <div className="weather-details">
          <h3>Weather Details:</h3>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Windspeed: {weather.windspeed} km/h</p>
          <p>Weather Code: {weather.weathercode}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;

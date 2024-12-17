import React, { useState } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!city.trim()) {
      setError('City name cannot be empty!');
      setWeather(null);
      return;
    }

    try {
      setError(''); // Clear previous errors
      setWeather(null); // Reset weather data

      const response = await fetch(`http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`);
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to connect to the server. Please try again.');
    }
  };

  return (
    <div className="wrapper">
      <h1>Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>

      {error && <div className="error">{error}</div>}

      {weather && (
        <div className="weather-details">
          <h3>Weather Details:</h3>
          <p>City: {weather.city}</p>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Windspeed: {weather.windspeed} km/h</p>
          <p>Weather Code: {weather.weathercode}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;

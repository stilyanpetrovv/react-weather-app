import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { getRainDescription, getSnowfallDescription, getCloudCoverDescription, getTimeOfDay } from '../utils/weatherUtils';
// import react-icons
import { FaSun, FaMoon } from "react-icons/fa";
import { WiNightClear, WiDaySunny, WiSnow, WiThermometer, WiStrongWind, WiRain, WiCloud, WiCloudy, WiHumidity } from "react-icons/wi";

const fetcher = (url) => axios.get(url).then((res) => res.data);

function WeatherApp() {
  const [city, setCity] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [countryCodes, setCountryCodes] = useState([]);
  const [countryCode, setCountryCode] = useState('ALL');
  const [tempCountryCode, setTempCountryCode] = useState('ALL'); // Temporary storage for dropdown selection
  const [showForecast, setShowForecast] = useState(false);
  const [query, setQuery] = useState(null);
  
  const { data: weather, error, isValidating } = useSWR(
    query && query.city // Ensure `query.city` is non-empty
      ? `http://localhost:3000/current-weather?city=${query.city}&country=${query.country}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // Cache for 2 minutes
    }
  );

    // Determine which city to use for forecast (from input, tempCity, or query)
  const forecastCity = city.trim() || tempCity || query?.city || '';
  const forecastCountry = tempCountryCode !== 'ALL' ? tempCountryCode : (query?.country || '');

    // Forecast SWR hook with proper configuration
  const { 
    data: forecast, 
    error: forecastError,
    isValidating: isForecastLoading 
  } = useSWR(
    showForecast && forecastCity
      ? `http://localhost:3000/daily-weather?city=${forecastCity}&country=${forecastCountry}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // 2 minute cache
    }
  );

  // Reset forecast when city changes (only if forecast was showing)
  useEffect(() => {
    if (showForecast) {
      // Keep forecast visible but it will refetch with new city
    }
  }, [city, query?.city]);

  // Forecast button handler
  const handleForecastClick = () => {
    setShowForecast(!showForecast); // Toggle forecast visibility
  };

  //fetch country code dynamically from backend
  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/country-codes');
        setCountryCodes(response.data);
      } catch (error) {
        console.error('Error fetching country codes:', error.message);
        // Retry after a delay
        setTimeout(fetchCountryCodes, 5000); // Retry in 5 seconds
      }
    };
  
    fetchCountryCodes();
  }, []);

  const handleCountryChange = (e) => {
    setTempCountryCode(e.target.value); // Change only the temporary value
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city.trim()) {
      alert('City name cannot be empty!');
      return;
    }
    
    setCountryCode(tempCountryCode);
    setQuery({
      city: city.trim(),
      country: tempCountryCode !== 'ALL' ? tempCountryCode : '', // Pass empty if "ALL"
    });
    setCity("");
    setTempCity(city)
  };

  // Simplified weather descriptions
  const timeOfDay = getTimeOfDay(weather?.is_day);
  const rainDescription = getRainDescription(weather?.rain, weather?.showers);
  const snowfall = getSnowfallDescription(weather?.snowfall);
  const cloudCover = getCloudCoverDescription(weather?.cloud_cover);

  // Render page
  return (
    <div className="min-h-screen flex items-center justify-center scale-125 bg-white text-gray-200">
      <div className="bg-gray-300 p-8 rounded shadow-md w-full max-w-sm">
      <h1 className="text-xl font-bold mb-4 text-gray-700 text-center">Weather App</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2 border border-gray-600 rounded mb-4 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <select
          value={tempCountryCode}
          onChange={handleCountryChange}
          className="w-full px-4 py-2 border border-gray-600 rounded mb-4 bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Get Weather
        </button>

        {isValidating && <p className="text-green-400 mt-4">Loading...</p>}
        {error && <p className="text-red-400 mt-4">Error: {error.response?.data?.error || error.message}</p>}

        {/* Weather info */}
        {weather && (
          <div className="mt-4 flex flex-col items-center justify-center text-center bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Weather Details for {tempCity.toUpperCase()}</h3>
            <div className="flex flex-col items-center gap-2 space-y-0.5">
              
              {/* Time of day conditions */}
              <div>
                {weather?.is_day === 0 ? (
                  <p className="flex items-center">
                    <span><FaMoon className="text-indigo-700 text-xl mr-2 mb-1"/></span>
                    <span className="font-bold text-indigo-700 mr-2">
                      Right now it's: </span> {timeOfDay}
                  </p> 
                ) : (
                  // render day
                  <p className="flex items-center">
                    <span><FaSun className="text-yellow-500 text-xl mr-2 mb-1"/></span>
                    <span className="font-bold text-yellow-500 mr-2">
                      Right now it's: </span> {timeOfDay}
                  </p>
                )}
              </div>
              <p className='flex items-center'>
                <span><WiThermometer className='text-teal-300 text-3xl mb-0.5'/></span>
                <span className="font-bold text-teal-300 mr-2">Temperature:</span> {weather.temperature}°C
              </p>

              {/* wind speed */}
              <p className='flex items-center'>
                <span><WiStrongWind className='text-blue-300 text-3xl mr-1 mb-1'/></span>
                <span className="font-bold text-blue-300 mr-2">
                  Windspeed:</span> {weather.windspeed} km/h
              </p>
              {/* humidity */}
              <p className="flex items-center">
                <span><WiHumidity className='text-yellow-300 text-3xl mb-0.5'/></span>
                <span className="font-bold text-yellow-300 mr-2">
                  Relative humidity: </span> {weather.relative_humidity}
              </p>
              
              {/* cloudy weather conditions */}
              <p className="flex items-center">
                <span className="text-pink-500 mr-0.5">
                  {cloudCover === "Clear" && weather?.is_day === 1 ? (
                    <WiDaySunny className="text-pink-500 text-3xl" />
                  ) : cloudCover === "Clear" && weather?.is_day === 0 ? (
                    <WiNightClear className="text-pink-500 text-4xl mb-1 -mr-0.5" />
                  ) : cloudCover === "Partially cloudy" ? (
                    <WiCloud className="text-pink-500 text-4xl" />
                  ) : (
                    <WiCloudy className="text-pink-500 text-4xl" />
                  )}
                </span>
                <span className="font-bold text-pink-500 mr-2">Cloud cover:</span> {cloudCover}
              </p>

              {/* rain conditions */}
              <div>
                {/* Render only if there's rain or snow */}
                {weather?.rain > 0 || weather?.snowfall > 0 || weather?.showers > 0 ? (
                  <div>
                    {/* Check if snow is greater than rain */}
                    {weather?.snowfall > weather?.rain ? (
                      <p className="flex items-center">
                        <span><WiSnow className="text-blue-400 text-3xl mr-1"/></span>
                        <span className="font-bold text-blue-400 mr-2">Snow:</span> {snowfall}
                      </p>
                    ) : (
                      <p className="flex items-center">
                        <span><WiRain className="text-blue-400 text-3xl mr-1"/></span>
                        <span className="font-bold text-blue-400 mr-2">Rain:</span> {rainDescription}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
        </div>
      )}
        <button
            type="button"
            onClick={handleForecastClick}
            className="mt-4 w-full bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {showForecast ? 'Hide' : 'Show'} 7-Day Forecast
        </button>
       </form>
      </div>
      {/* Forecast Display */}
      {showForecast && (
          <div className="mt-6">
            {isForecastLoading && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-600">Loading forecast...</p>
              </div>
            )}

            {forecastError && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-red-600">Forecast error: {forecastError.message}</p>
              </div>
            )}

{forecast?.date?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 gap-4">
                {forecast.date.map((date, index) => (
                  <div key={date} className="bg-white p-4 rounded-lg shadow min-w-[200px]">
                    <h3 className="font-bold text-indigo-800 mb-2">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span className="text-red-500">High:</span>
                        <span className="text-indigo-800">{forecast.temperature_max[index]}°C</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-blue-500">Low:</span>
                        <span className="text-indigo-800">{forecast.temperature_min[index]}°C</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Wind:</span>
                        <span className="text-indigo-800">{forecast.wind_speed_10m_max[index]} km/h</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
  );
}

export default WeatherApp;
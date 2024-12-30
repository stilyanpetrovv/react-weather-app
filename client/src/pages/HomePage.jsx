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
  const [countryCodes, setCountryCodes] = useState([]);
  const [countryCode, setCountryCode] = useState('ALL');
  const [tempCountryCode, setTempCountryCode] = useState('ALL'); // Temporary storage for dropdown selection
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
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Weather Details</h3>
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
       </form>
      </div>
    </div>
  );
}

export default WeatherApp;
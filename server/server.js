import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors'
import fetch from "node-fetch";
import NodeCache from 'node-cache';
import { rateLimiter } from "hono-rate-limiter";
import countryCodes from './data/countryCodes.js';

const app = new Hono();
const weatherCache = new NodeCache({ stdTTL: 120 }); // Cache TTL of 2 minutes (120 seconds)

const keyGenerator = (c) => {
  const xForwardedFor = c.req.header('x-forwarded-for');
  const realIp = xForwardedFor?.split(',')[0].trim();
  const ipAddress = realIp || c.req.ip || 'unknown';
  return ipAddress;
};

app.use('*', cors({
  origin: 'http://localhost:5173',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// rate limiting
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: "draft-6",
    keyGenerator,
    onLimitExceeded: (c) => {
      return c.text('Rate limit exceeded. Try again later.', 429);
    },
  })
);

app.get('/country-codes', async (c) => {
  return c.json(countryCodes);
});

app.get('/current-weather', async (c) => {
  // Extract query parameters
  const city = c.req.query("city")?.trim().toLocaleLowerCase();
  const country = c.req.query("country")?.trim().toUpperCase();

  // Input validation
  if (!city || city === "") {
    return c.json({ error: "City name cannot be empty!" }, 400);
  }

  const countryParam = country && country !== 'ALL' ? `&countrycodes=${country}` : '';

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}${countryParam}`;

  // Generate a unique key
  const cacheKey = `${city.toLowerCase()}_${country ? country.toLowerCase() : 'all'}`;

  // Check cache
  const cachedWeather = weatherCache.get(cacheKey);
  if (cachedWeather) {
    console.log('Serving from cache:', cachedWeather);
    return c.json(cachedWeather);
  }

  try {    
    // step 1: Get city coordinates using Nominatim API
    const geoResponse = await fetch(url);

    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      return c.json({ error: "City not found. Please check the city name." }, 404);
    }

    const { lat, lon } = geoData[0]; // Extract latitude and longitude
    
    // step 2: Fetch weather data
    const currentWeatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,cloud_cover,wind_speed_10m`
    );

    if (!currentWeatherResponse.ok) {
      return c.json({ error: "Failed to fetch weather data." }, 500);
    }

    const currentWeatherData = await currentWeatherResponse.json();
    
    // simplify the result
    const result = {
      is_day: currentWeatherData.current.is_day,
      temperature: currentWeatherData.current.temperature_2m,
      windspeed: currentWeatherData.current.wind_speed_10m,
      relative_humidity: currentWeatherData.current.relative_humidity_2m,
      cloud_cover: currentWeatherData.current.cloud_cover,
      rain: currentWeatherData.current.rain,
      showers: currentWeatherData.current.showers,
      snowfall: currentWeatherData.current.snowfall,
    };

    // Cache the fetched weather data
    weatherCache.set(cacheKey, result);
    console.log('Caching data for key:', cacheKey, result);
    return c.json(result);
  } catch (error) {
    console.error("Error ferching weather data: ", error);
    return c.json({ error: "Internal server error." }, 500);
  }
});

app.get('/daily-weather', async (c) => {
  // Extract query parameters
  const city = c.req.query("city")?.trim().toLocaleLowerCase();
  const country = c.req.query("country")?.trim().toUpperCase();

  // Input validation
  if (!city || city === "") {
    return c.json({ error: "City name cannot be empty!" }, 400);
  }

  const countryParam = country && country !== 'ALL' ? `&countrycodes=${country}` : '';

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}${countryParam}`;

  // Generate a unique key
  const cacheKey = `${city.toLowerCase()}_${country ? country.toLowerCase() : 'all'}`;

  // Check cache
  const cachedWeather = weatherCache.get(cacheKey);
  if (cachedWeather) {
    console.log('Serving from cache:', cachedWeather);
    return c.json(cachedWeather);
  }

  try {    
    // step 1: Get city coordinates using Nominatim API
    const geoResponse = await fetch(url);

    const geoData = await geoResponse.json();

    if (!geoData || geoData.length === 0) {
      return c.json({ error: "City not found. Please check the city name." }, 404);
    }

    const { lat, lon } = geoData[0]; // Extract latitude and longitude
    
    const dailyWeatherResponce = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,showers_sum,snowfall_sum,wind_speed_10m_max`
    );

    if (!dailyWeatherResponce.ok) {
      return c.json({ error: "Failed to fetch weather data." }, 500);
    }

    const dailyWeatherData = await dailyWeatherResponce.json();

    const dailyResult = {
      temperature_max: dailyWeatherData.daily.temperature_2m_max,
      temperature_min: dailyWeatherData.daily.temperature_2m_min,
      // windspeed: currentWeatherData.current.wind_speed_10m,
      // relative_humidity: currentWeatherData.current.relative_humidity_2m,
      // cloud_cover: currentWeatherData.current.cloud_cover,
      // rain: currentWeatherData.current.rain,
      // showers: currentWeatherData.current.showers,
      // snowfall: currentWeatherData.current.snowfall,
    };

    console.log(dailyResult);

    // Cache the fetched weather data
    weatherCache.set(cacheKey, dailyResult);
    console.log('Caching data for key:', cacheKey, dailyResult);
    return c.json(result);
  } catch (error) {
    console.error("Error ferching weather data: ", error);
    return c.json({ error: "Internal server error." }, 500);
  }
})


// Start the server
serve({
  fetch: app.fetch,
  port: 3000,
});

console.log('Server is running on http://localhost:3000');

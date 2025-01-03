import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors'
import fetch from "node-fetch";
import NodeCache from 'node-cache';
import { rateLimiter } from "hono-rate-limiter";
import countryCodes from './data/countryCodes.js';

const app = new Hono();
const weatherCache = new NodeCache({ stdTTL: 120 }); // Cache TTL of 2 minutes (120 seconds)
// custom key generator for rate limiting using user's IP 
const keyGenerator = (c) => {
  // Extract the "X-Forwarded-For" header
  const xForwardedFor = c.req.header('x-forwarded-for');
  // If multiple IPs are listed, take the first one (original client)
  const realIp = xForwardedFor?.split(',')[0].trim();
  // Fallback to direct IP if "X-Forwarded-For" is not present
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
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,cloud_cover,wind_speed_10m`
    );

    if (!weatherResponse.ok) {
      return c.json({ error: "Failed to fetch weather data." }, 500);
    }

    const weatherData = await weatherResponse.json();
    
    // simplify the result
    const result = {
      is_day: weatherData.current.is_day,
      temperature: weatherData.current.temperature_2m,
      windspeed: weatherData.current.wind_speed_10m,
      relative_humidity: weatherData.current.relative_humidity_2m,
      cloud_cover: weatherData.current.cloud_cover,
      rain: weatherData.current.rain,
      showers: weatherData.current.showers,
      snowfall: weatherData.current.snowfall,
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

// Start the server
serve({
  fetch: app.fetch,
  port: 3000,
});

console.log('Server is running on http://localhost:3000');

#!/usr/bin/env node
/**
 * Fetch current weather from Open-Meteo (no API key required).
 *
 * Usage:
 *   node skills/check-weather/scripts/check-weather.ts London
 *   node skills/check-weather/scripts/check-weather.ts --lat 51.5 --lon -0.12
 */

const DEFAULT_CITY = "London";

const parseArgs = (argv) => {
  const args = { city: null, lat: null, lon: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === "--lat") {
      args.lat = Number(argv[i + 1]);
      i += 1;
    } else if (value === "--lon") {
      args.lon = Number(argv[i + 1]);
      i += 1;
    } else if (!value.startsWith("-")) {
      args.city = value;
    }
  }
  return args;
};

const geocodeCity = async (city) => {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed (${response.status})`);
  }
  const body = await response.json();
  const place = body.results?.[0];
  if (!place) {
    throw new Error(`No geocoding result for "${city}"`);
  }
  return {
    label: [place.name, place.admin1, place.country_code]
      .filter(Boolean)
      .join(", "),
    latitude: place.latitude,
    longitude: place.longitude,
  };
};

const fetchWeather = async (latitude, longitude) => {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  url.searchParams.set("hourly", "precipitation_probability");
  url.searchParams.set("forecast_hours", "6");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather fetch failed (${response.status})`);
  }
  return response.json();
};

const weatherCodeLabel = (code) => {
  const map = {
    0: "clear",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "fog",
    48: "depositing rime fog",
    51: "light drizzle",
    61: "rain",
    71: "snow",
    80: "rain showers",
    95: "thunderstorm",
  };
  return map[code] ?? `code ${code}`;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  let label;
  let latitude = args.lat;
  let longitude = args.lon;

  if (latitude == null || longitude == null || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    const place = await geocodeCity(args.city || DEFAULT_CITY);
    label = place.label;
    latitude = place.latitude;
    longitude = place.longitude;
  } else {
    label = `${latitude}, ${longitude}`;
  }

  const forecast = await fetchWeather(latitude, longitude);
  const current = forecast.current;
  const probs = forecast.hourly?.precipitation_probability ?? [];
  const maxRainChance = probs.length
    ? Math.max(...probs.filter((value) => typeof value === "number"))
    : null;

  console.log(`Location: ${label}`);
  console.log(
    `Now: ${current.temperature_2m}°C, ${weatherCodeLabel(current.weather_code)}, wind ${current.wind_speed_10m} km/h`
  );
  if (maxRainChance != null) {
    console.log(`Next hours max precipitation probability: ${maxRainChance}%`);
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

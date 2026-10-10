/**
 * Weather Service for E-Move
 *
 * Notice on WeatherTracker.com:
 * WeatherTracker.com does not provide a documented, public, free REST API for client-side integration
 * without commercial authentication or scraping. As instructed, we utilize the documented
 * Open-Meteo Forecast API (https://open-meteo.com/en/docs) which is open, CORS-enabled,
 * and requires no API secret in client code.
 */

import { WeatherData } from '../types/emove';

export async function fetchLiveWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      throw new Error(`Open-Meteo API returned status ${res.status}`);
    }
    const data = await res.json();
    const current = data.current;

    return {
      temperatureC: current.temperature_2m ?? 24.5,
      windSpeedKmh: current.wind_speed_10m ?? 12.0,
      windDirectionDeg: current.wind_direction_10m ?? 45,
      apparentTempC: current.apparent_temperature ?? 25.0,
      precipitationMm: current.precipitation ?? 0.0,
      source: 'Open-Meteo Global Forecast API (Live)',
      timestamp: current.time ? new Date(current.time).toLocaleTimeString() : new Date().toLocaleTimeString(),
      isLive: true,
    };
  } catch (err) {
    console.warn('[E-Move Weather] Live query failed, falling back to simulated baseline weather:', err);
    return {
      temperatureC: 22.0,
      windSpeedKmh: 14.0,
      windDirectionDeg: 60,
      apparentTempC: 22.5,
      precipitationMm: 0.0,
      source: 'Open-Meteo Demo Fallback (Network Offline)',
      timestamp: new Date().toLocaleTimeString(),
      isLive: false,
    };
  }
}

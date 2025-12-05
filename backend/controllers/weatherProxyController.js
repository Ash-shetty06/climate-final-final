import axios from 'axios';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 3600 });

const WEATHER_API_URL = 'https://archive-api.open-meteo.com/v1/archive';
const CURRENT_WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const AQI_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const MET_NORWAY_API_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const WAQI_API_URL = 'https://api.waqi.info/feed';
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const getCurrentWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        const cacheKey = `weather-current-${lat}-${lon}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const response = await axios.get(CURRENT_WEATHER_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,apparent_temperature,surface_pressure,visibility,cloud_cover,uv_index,weather_code',
                daily: 'sunrise,sunset',
                forecast_days: 1,
                timezone: 'auto'
            }
        });

        const current = response.data.current;
        const daily = response.data.daily;

        const data = {
            temp: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            rainProb: current.precipitation > 0 ? 100 : 0,
            feelsLike: current.apparent_temperature,
            pressure: current.surface_pressure,
            visibility: current.visibility / 1000,
            cloudCover: current.cloud_cover,
            uvIndex: current.uv_index,
            weatherCode: current.weather_code,
            sunrise: daily?.sunrise?.[0],
            sunset: daily?.sunset?.[0],
            lastUpdated: 'Now'
        };

        cache.set(cacheKey, data);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching current weather:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCurrentAQI = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        const cacheKey = `aqi-current-${lat}-${lon}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const response = await axios.get(AQI_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'pm2_5,pm10,ozone,nitrogen_dioxide,carbon_monoxide',
                timezone: 'UTC'
            }
        });

        const current = response.data.current;
        let aqi = current.pm2_5 * 4;
        if (aqi > 500) aqi = 500;

        const data = {
            aqi: Math.round(aqi),
            pm25: current.pm2_5,
            pm10: current.pm10,
            o3: current.ozone,
            no2: current.nitrogen_dioxide,
            co: current.carbon_monoxide,
            lastUpdated: 'Now'
        };

        cache.set(cacheKey, data);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching current AQI:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistoricalData = async (req, res) => {
    try {
        const { lat, lon, startDate, endDate } = req.query;

        if (!lat || !lon || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Latitude, longitude, startDate, and endDate required'
            });
        }

        const cacheKey = `historical-${lat}-${lon}-${startDate}-${endDate}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const today = new Date();
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - 5);

        const requestEndDate = new Date(endDate);
        const adjustedEndDate = requestEndDate > fiveDaysAgo
            ? fiveDaysAgo.toISOString().split('T')[0]
            : endDate;

        const openMeteoPromise = axios.get(WEATHER_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                start_date: startDate,
                end_date: adjustedEndDate,
                daily: 'temperature_2m_mean,rain_sum',
                models: 'era5_seamless',
                timezone: 'UTC'
            }
        });

        const vcPromise = axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}/${startDate}/${adjustedEndDate}`, {
            params: {
                key: process.env.VISUAL_CROSSING_KEY,
                unitGroup: 'metric',
                include: 'days',
                elements: 'datetime,temp,precip,aqi'
            }
        }).catch(err => {
            console.warn("Visual Crossing API error:", err.message);
            return { data: { days: [] } };
        });

        const aqiPromise = axios.get(AQI_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                start_date: startDate,
                end_date: adjustedEndDate,
                hourly: 'pm2_5',
                timezone: 'UTC'
            }
        }).catch(err => {
            console.warn("AQI data not available:", err.message);
            return { data: { hourly: { time: [], pm2_5: [] } } };
        });

        const [openMeteoRes, vcRes, aqiRes] = await Promise.all([
            openMeteoPromise,
            vcPromise,
            aqiPromise
        ]);

        const omDaily = openMeteoRes.data.daily;
        const vcDays = vcRes.data.days || [];
        const aqiHourly = aqiRes.data.hourly || { time: [], pm2_5: [] };

        if (!omDaily || !omDaily.time) {
            return res.status(500).json({ success: false, message: 'No weather data returned from API' });
        }

        const getDailyAqi = (dateStr) => {
            if (!aqiHourly.time || aqiHourly.time.length === 0) return 0;
            const dayIndices = aqiHourly.time
                .map((t, i) => t.startsWith(dateStr) ? i : -1)
                .filter(i => i !== -1);
            if (dayIndices.length === 0) return 0;
            const sum = dayIndices.reduce((acc, idx) => acc + (aqiHourly.pm2_5[idx] || 0), 0);
            const avgPm25 = sum / dayIndices.length;
            let aqi = avgPm25 * 4;
            if (aqi > 500) aqi = 500;
            return Math.round(aqi);
        };

        const formattedData = omDaily.time.map((date, index) => {
            const vcDay = vcDays.find(d => d.datetime === date);

            return {
                date: date,
                temp_om: omDaily.temperature_2m_mean[index] || 0,
                temp_vc: vcDay ? vcDay.temp : null,
                rain_om: omDaily.rain_sum[index] || 0,
                rain_vc: vcDay ? vcDay.precip : null,
                aqi_om: getDailyAqi(date),
                aqi_vc: vcDay ? vcDay.aqi : null
            };
        });

        cache.set(cacheKey, formattedData);
        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error('Error fetching historical data:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHourlyForecast = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        const cacheKey = `hourly-${lat}-${lon}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const response = await axios.get(CURRENT_WEATHER_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                hourly: 'temperature_2m,precipitation_probability,weather_code',
                forecast_hours: 24,
                timezone: 'auto'
            }
        });

        cache.set(cacheKey, response.data.hourly);
        res.status(200).json({ success: true, data: response.data.hourly });
    } catch (error) {
        console.error('Error fetching hourly forecast:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDailyForecast = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        const cacheKey = `daily-${lat}-${lon}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const response = await axios.get(CURRENT_WEATHER_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,uv_index_max,sunrise,sunset',
                forecast_days: 7,
                timezone: 'auto'
            }
        });

        cache.set(cacheKey, response.data.daily);
        res.status(200).json({ success: true, data: response.data.daily });
    } catch (error) {
        console.error('Error fetching daily forecast:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMetNorwayWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        const cacheKey = `met-norway-${lat}-${lon}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const response = await axios.get(MET_NORWAY_API_URL, {
            params: { lat, lon }
        });

        const timeseries = response.data.properties.timeseries[0];
        const data = timeseries.data.instant.details;

        const weatherData = {
            temp: data.air_temperature,
            windSpeed: data.wind_speed,
            humidity: data.relative_humidity,
            pressure: data.air_pressure_at_sea_level,
            cloudCover: data.cloud_area_fraction,
            lastUpdated: timeseries.time
        };

        cache.set(cacheKey, weatherData);
        res.status(200).json({ success: true, data: weatherData });
    } catch (error) {
        console.warn('MET Norway API error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWaqiFeed = async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        const cacheKey = `waqi-${lat}-${lon}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        // FIXED: Removed spaces from URL
        const response = await axios.get(`${WAQI_API_URL}/geo:${lat};${lon}/`, {
            params: { token: process.env.WAQI_KEY }
        });

        if (response.data.status !== 'ok') {
            throw new Error(response.data.data);
        }

        const data = response.data.data;
        const waqiData = {
            aqi: data.aqi,
            station: data.city.name,
            lastUpdated: data.time.s,
            source: data.attributions[0]?.name || 'WAQI'
        };

        cache.set(cacheKey, waqiData);
        res.status(200).json({ success: true, data: waqiData });
    } catch (error) {
        console.warn('WAQI API error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchCities = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
        }

        const cacheKey = `search-${query}`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const response = await axios.get(GEOCODING_API_URL, {
            params: {
                name: query,
                count: 10,
                language: 'en',
                format: 'json'
            }
        });

        if (!response.data.results) {
            return res.status(200).json({ success: true, data: [] });
        }

        const indianCities = response.data.results.filter(city => city.country_code === 'IN');

        const cities = indianCities.map(city => ({
            id: city.id,
            name: city.name,
            lat: city.latitude,
            lon: city.longitude,
            state: city.admin1,
            country: city.country
        }));

        cache.set(cacheKey, cities);
        res.status(200).json({ success: true, data: cities });
    } catch (error) {
        console.error('Error searching cities:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAQIForecast = async (req, res) => {
    try {
        const { lat, lon, days = 7 } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
        }

        const cacheKey = `aqi-forecast-${lat}-${lon}-${days}d`;
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: cachedData, cached: true });
        }

        const response = await axios.get(AQI_API_URL, {
            params: {
                latitude: lat,
                longitude: lon,
                hourly: 'pm2_5,pm10,european_aqi',
                forecast_days: days,
                timezone: 'auto'
            }
        });

        // Calculate daily average AQI from hourly data
        const hourly = response.data.hourly;
        const dailyAQI = [];

        if (hourly && hourly.time) {
            const hoursPerDay = 24;
            const numDays = Math.floor(hourly.time.length / hoursPerDay);

            for (let day = 0; day < numDays; day++) {
                const startIdx = day * hoursPerDay;
                const endIdx = startIdx + hoursPerDay;

                const dayAQI = hourly.european_aqi.slice(startIdx, endIdx).filter(v => v !== null);
                const avgAQI = dayAQI.length > 0
                    ? Math.round(dayAQI.reduce((sum, val) => sum + val, 0) / dayAQI.length)
                    : null;

                dailyAQI.push({
                    date: hourly.time[startIdx].split('T')[0],
                    aqi: avgAQI
                });
            }
        }

        cache.set(cacheKey, dailyAQI);
        res.status(200).json({ success: true, data: dailyAQI });
    } catch (error) {
        console.error('Error fetching AQI forecast:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const clearCache = (req, res) => {
    cache.flushAll();
    res.status(200).json({ success: true, message: 'Cache cleared' });
};

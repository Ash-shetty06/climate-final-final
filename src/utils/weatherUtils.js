export const getWeatherDescription = (code) => {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
};

export const getWeatherIconName = (code) => {
    if (code === 0 || code === 1) return 'Sun';
    if (code === 2) return 'CloudSun';
    if (code === 3) return 'Cloud';
    if (code === 45 || code === 48) return 'CloudFog';
    if (code >= 51 && code <= 55) return 'CloudDrizzle';
    if (code >= 61 && code <= 65) return 'CloudRain';
    if (code >= 71 && code <= 77) return 'Snowflake';
    if (code >= 80 && code <= 82) return 'CloudRainWind';
    if (code >= 85 && code <= 86) return 'CloudSnow';
    if (code >= 95 && code <= 99) return 'CloudLightning';
    return 'Cloud';
};

export const generateAlerts = (weather, aqi, forecast) => {
    const alerts = [];

    
    if (weather?.temp > 40) {
        alerts.push({
            id: 'extreme-heat',
            type: 'danger',
            title: 'Extreme Heat Warning',
            message: `Temperature is ${weather.temp.toFixed(1)}°C. Avoid outdoor activities and stay hydrated.`,
            color: 'bg-red-50 border-red-200 text-red-800'
        });
    }

    
    if (weather?.temp < 5) {
        alerts.push({
            id: 'cold-warning',
            type: 'warning',
            title: 'Cold Weather Alert',
            message: `Temperature is ${weather.temp.toFixed(1)}°C. Dress warmly and protect against frostbite.`,
            color: 'bg-blue-50 border-blue-200 text-blue-800'
        });
    }

    
    if (aqi?.aqi > 200) {
        alerts.push({
            id: 'air-quality',
            type: 'danger',
            title: 'Unhealthy Air Quality',
            message: `AQI is ${aqi.aqi}. Avoid outdoor activities and use air purifiers indoors.`,
            color: 'bg-purple-50 border-purple-200 text-purple-800'
        });
    }

    
    if (weather?.uvIndex > 8) {
        alerts.push({
            id: 'uv-warning',
            type: 'warning',
            title: 'Very High UV Index',
            message: `UV Index is ${weather.uvIndex}. Use SPF 30+ sunscreen and avoid midday sun.`,
            color: 'bg-orange-50 border-orange-200 text-orange-800'
        });
    }

    
    if (forecast?.daily?.precipitation_sum?.[0] > 50) {
        alerts.push({
            id: 'heavy-rain',
            type: 'info',
            title: 'Heavy Rain Expected',
            message: `${forecast.daily.precipitation_sum[0].toFixed(0)}mm of rain forecasted. Carry an umbrella.`,
            color: 'bg-cyan-50 border-cyan-200 text-cyan-800'
        });
    }

    return alerts;
};

export const formatTime = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const getUVRecommendation = (uvIndex) => {
    if (uvIndex <= 2) return { level: 'Low', advice: 'No protection needed', color: 'text-green-600' };
    if (uvIndex <= 5) return { level: 'Moderate', advice: 'Wear sunscreen', color: 'text-yellow-600' };
    if (uvIndex <= 7) return { level: 'High', advice: 'Protection essential', color: 'text-orange-600' };
    if (uvIndex <= 10) return { level: 'Very High', advice: 'Extra protection required', color: 'text-red-600' };
    return { level: 'Extreme', advice: 'Avoid sun exposure', color: 'text-purple-600' };
};

export const formatDay = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export const getPressureTrend = (pressure) => {
    
    if (pressure > 1020) return { trend: 'High', icon: '↑', color: 'text-blue-600' };
    if (pressure < 1010) return { trend: 'Low', icon: '↓', color: 'text-orange-600' };
    return { trend: 'Normal', icon: '→', color: 'text-slate-600' };
};

import React from 'react';
import {
    Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudSnow,
    CloudLightning, Snowflake, CloudFog, CloudRainWind
} from 'lucide-react';
import { getWeatherIconName } from '../utils/weatherUtils';

const WeatherIcon = ({ code, size = 24, className = '' }) => {
    const iconName = getWeatherIconName(code);
    const iconProps = { size, className };

    const icons = {
        Sun: <Sun {...iconProps} className={`text-yellow-500 ${className}`} />,
        CloudSun: <CloudSun {...iconProps} className={`text-orange-400 ${className}`} />,
        Cloud: <Cloud {...iconProps} className={`text-slate-400 ${className}`} />,
        CloudFog: <CloudFog {...iconProps} className={`text-slate-300 ${className}`} />,
        CloudDrizzle: <CloudDrizzle {...iconProps} className={`text-blue-400 ${className}`} />,
        CloudRain: <CloudRain {...iconProps} className={`text-blue-600 ${className}`} />,
        Snowflake: <Snowflake {...iconProps} className={`text-cyan-300 ${className}`} />,
        CloudRainWind: <CloudRainWind {...iconProps} className={`text-blue-700 ${className}`} />,
        CloudSnow: <CloudSnow {...iconProps} className={`text-cyan-400 ${className}`} />,
        CloudLightning: <CloudLightning {...iconProps} className={`text-purple-600 ${className}`} />
    };

    return icons[iconName] || icons.Cloud;
};

export default WeatherIcon;

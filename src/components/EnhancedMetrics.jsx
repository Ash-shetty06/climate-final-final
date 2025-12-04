import React from 'react';
import { Thermometer, Gauge, Sun, Sunrise, Sunset, Eye, Cloud } from 'lucide-react';
import { formatTime, getUVRecommendation, getPressureTrend } from '../utils/weatherUtils';

const EnhancedMetrics = ({ feelsLike, pressure, uvIndex, sunrise, sunset, visibility, cloudCover }) => {
    const uvInfo = getUVRecommendation(uvIndex || 0);
    const pressureInfo = getPressureTrend(pressure || 1013);

    const metrics = [
        {
            icon: <Thermometer className="w-5 h-5 text-orange-500" />,
            label: 'Feels Like',
            value: feelsLike ? `${feelsLike.toFixed(1)}°C` : '--',
            subtitle: 'Apparent temperature'
        },
        {
            icon: <Gauge className="w-5 h-5 text-blue-500" />,
            label: 'Pressure',
            value: pressure ? `${pressure.toFixed(0)} hPa` : '--',
            subtitle: `${pressureInfo.trend} ${pressureInfo.icon}`,
            subtitleColor: pressureInfo.color
        },
        {
            icon: <Sun className="w-5 h-5 text-yellow-500" />,
            label: 'UV Index',
            value: uvIndex !== undefined ? uvIndex.toFixed(0) : '--',
            subtitle: uvInfo.advice,
            subtitleColor: uvInfo.color
        },
        {
            icon: <Sunrise className="w-5 h-5 text-amber-500" />,
            label: 'Sunrise',
            value: formatTime(sunrise),
            subtitle: 'Local time'
        },
        {
            icon: <Sunset className="w-5 h-5 text-orange-600" />,
            label: 'Sunset',
            value: formatTime(sunset),
            subtitle: 'Local time'
        },
        {
            icon: <Eye className="w-5 h-5 text-slate-500" />,
            label: 'Visibility',
            value: visibility ? `${(visibility / 1000).toFixed(1)} km` : '--',
            subtitle: 'Clear view distance'
        },
        {
            icon: <Cloud className="w-5 h-5 text-slate-400" />,
            label: 'Cloud Cover',
            value: cloudCover !== undefined ? `${cloudCover}%` : '--',
            subtitle: 'Sky coverage'
        }
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Additional Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            {metric.icon}
                            <span className="text-xs font-medium text-slate-600">{metric.label}</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900 mb-1">{metric.value}</div>
                        <div className={`text-xs ${metric.subtitleColor || 'text-slate-500'}`}>
                            {metric.subtitle}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EnhancedMetrics;

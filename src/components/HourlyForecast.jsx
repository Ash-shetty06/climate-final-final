import React from 'react';
import WeatherIcon from './WeatherIcon';
import { Droplets } from 'lucide-react';

const HourlyForecast = ({ data }) => {
    if (!data || !data.time) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">24-Hour Forecast</h3>
                <p className="text-slate-500">Loading forecast data...</p>
            </div>
        );
    }

    
    const hours = data.time.slice(0, 24).map((time, index) => ({
        time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
        temp: data.temperature_2m[index],
        precipitation: data.precipitation_probability?.[index] || 0,
        weatherCode: data.weather_code?.[index] || 0
    }));

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">24-Hour Forecast</h3>
            <div className="overflow-x-auto -mx-2 px-2">
                <div className="flex gap-4 min-w-max pb-2">
                    {hours.map((hour, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center bg-slate-50 rounded-lg p-3 min-w-[80px] hover:bg-slate-100 transition-colors"
                        >
                            <span className="text-xs font-medium text-slate-600 mb-2">{hour.time}</span>
                            <WeatherIcon code={hour.weatherCode} size={32} />
                            <span className="text-lg font-bold text-slate-900 mt-2">{hour.temp.toFixed(0)}°</span>
                            {hour.precipitation > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    <Droplets className="w-3 h-3 text-blue-500" />
                                    <span className="text-xs text-blue-600">{hour.precipitation}%</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HourlyForecast;

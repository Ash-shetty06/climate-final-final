import React from 'react';
import WeatherIcon from './WeatherIcon';
import { getWeatherDescription, formatDay, formatTime } from '../utils/weatherUtils';
import { Droplets, Sun, TrendingUp, TrendingDown } from 'lucide-react';

const DailyForecast = ({ data }) => {
    if (!data || !data.time) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">7-Day Forecast</h3>
                <p className="text-slate-500">Loading forecast data...</p>
            </div>
        );
    }

    const days = data.time.map((time, index) => ({
        day: formatDay(time),
        date: new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tempMax: data.temperature_2m_max[index],
        tempMin: data.temperature_2m_min[index],
        precipitation: data.precipitation_sum?.[index] || 0,
        weatherCode: data.weather_code?.[index] || 0,
        uvIndex: data.uv_index_max?.[index],
        sunrise: data.sunrise?.[index],
        sunset: data.sunset?.[index]
    }));

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">7-Day Forecast</h3>
            <div className="space-y-3">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                    >
                        {}
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-20">
                                <div className="font-bold text-slate-900">{day.day}</div>
                                <div className="text-xs text-slate-500">{day.date}</div>
                            </div>
                            <WeatherIcon code={day.weatherCode} size={36} />
                            <div className="hidden md:block text-sm text-slate-600">
                                {getWeatherDescription(day.weatherCode)}
                            </div>
                        </div>

                        {}
                        <div className="flex items-center gap-2 mx-4">
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-red-500" />
                                <span className="font-bold text-slate-900">{day.tempMax.toFixed(0)}°</span>
                            </div>
                            <span className="text-slate-400">/</span>
                            <div className="flex items-center gap-1">
                                <TrendingDown className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-slate-600">{day.tempMin.toFixed(0)}°</span>
                            </div>
                        </div>

                        {}
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                            {day.precipitation > 0 && (
                                <div className="flex items-center gap-1">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                    <span>{day.precipitation.toFixed(0)}mm</span>
                                </div>
                            )}
                            {day.uvIndex > 6 && (
                                <div className="flex items-center gap-1">
                                    <Sun className="w-4 h-4 text-orange-500" />
                                    <span className="text-orange-600">UV {day.uvIndex.toFixed(0)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyForecast;

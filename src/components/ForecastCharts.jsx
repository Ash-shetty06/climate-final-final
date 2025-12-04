import React from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ForecastCharts = ({ hourlyForecast, dailyForecast }) => {
    if (!hourlyForecast || !dailyForecast) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Forecast Visualizations</h3>
                <p className="text-slate-500">Loading forecast data...</p>
            </div>
        );
    }

    
    const hourlyTempSeries = [{
        name: 'Temperature',
        data: hourlyForecast.time.slice(0, 24).map((time, index) => ({
            x: new Date(time).getTime(),
            y: hourlyForecast.temperature_2m[index]
        }))
    }];

    const hourlyTempOptions = {
        chart: {
            type: 'line',
            height: 280,
            toolbar: { show: true },
            zoom: { enabled: true }
        },
        colors: ['#f97316'],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        markers: {
            size: 4,
            colors: ['#f97316'],
            strokeWidth: 2,
            strokeColors: '#fff'
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    hour: 'HH:mm'
                }
            }
        },
        yaxis: {
            title: { text: 'Temperature (°C)' },
            labels: {
                formatter: (val) => val.toFixed(1) + '°C'
            }
        },
        tooltip: {
            x: { format: 'HH:mm' },
            y: {
                formatter: (val) => val.toFixed(1) + '°C'
            }
        },
        grid: {
            borderColor: '#e2e8f0'
        }
    };

    
    const dailyTempSeries = [
        {
            name: 'High',
            data: dailyForecast.time.map((time, index) => ({
                x: new Date(time).getTime(),
                y: dailyForecast.temperature_2m_max[index]
            }))
        },
        {
            name: 'Low',
            data: dailyForecast.time.map((time, index) => ({
                x: new Date(time).getTime(),
                y: dailyForecast.temperature_2m_min[index]
            }))
        }
    ];

    const dailyTempOptions = {
        chart: {
            type: 'area',
            height: 300,
            toolbar: { show: true },
            zoom: { enabled: true }
        },
        colors: ['#ef4444', '#3b82f6'],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.3,
                opacityTo: 0.1
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    day: 'dd MMM'
                }
            }
        },
        yaxis: {
            title: { text: 'Temperature (°C)' },
            labels: {
                formatter: (val) => val.toFixed(0) + '°C'
            }
        },
        tooltip: {
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => val.toFixed(1) + '°C'
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left'
        },
        grid: {
            borderColor: '#e2e8f0'
        }
    };

    
    const temps24h = hourlyForecast.temperature_2m.slice(0, 24);
    const tempMax24h = Math.max(...temps24h);
    const tempMin24h = Math.min(...temps24h);
    const tempAvg24h = temps24h.reduce((a, b) => a + b, 0) / temps24h.length;

    const temps7d = [...dailyForecast.temperature_2m_max, ...dailyForecast.temperature_2m_min];
    const tempMax7d = Math.max(...dailyForecast.temperature_2m_max);
    const tempMin7d = Math.min(...dailyForecast.temperature_2m_min);
    const tempAvg7d = temps7d.reduce((a, b) => a + b, 0) / temps7d.length;

    return (
        <div className="space-y-6 mb-6">
            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-700">24h High</span>
                        <TrendingUp className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-red-900">{tempMax24h.toFixed(1)}°C</div>
                    <div className="text-xs text-red-600 mt-1">Next 24 hours</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-700">24h Low</span>
                        <TrendingDown className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-900">{tempMin24h.toFixed(1)}°C</div>
                    <div className="text-xs text-blue-600 mt-1">Next 24 hours</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">24h Average</span>
                        <Minus className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{tempAvg24h.toFixed(1)}°C</div>
                    <div className="text-xs text-slate-600 mt-1">Next 24 hours</div>
                </div>
            </div>

            {}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">24-Hour Temperature Trend</h3>
                <Chart
                    options={hourlyTempOptions}
                    series={hourlyTempSeries}
                    type="line"
                    height={280}
                />
            </div>

            {}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">7-Day Temperature Forecast</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-red-600 mb-1">7-Day High</div>
                        <div className="text-2xl font-bold text-red-900">{tempMax7d.toFixed(0)}°C</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-blue-600 mb-1">7-Day Low</div>
                        <div className="text-2xl font-bold text-blue-900">{tempMin7d.toFixed(0)}°C</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-600 mb-1">7-Day Average</div>
                        <div className="text-2xl font-bold text-slate-900">{tempAvg7d.toFixed(0)}°C</div>
                    </div>
                </div>
                <Chart
                    options={dailyTempOptions}
                    series={dailyTempSeries}
                    type="area"
                    height={300}
                />
            </div>
        </div>
    );
};

export default ForecastCharts;

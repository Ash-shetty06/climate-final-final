import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp } from 'lucide-react';

const PollutantTrends = ({ historyData }) => {
    const [timeRange, setTimeRange] = useState('7d');

    if (!historyData || historyData.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Pollutant Trends
                </h3>
                <p className="text-slate-500">Loading pollutant data...</p>
            </div>
        );
    }

    
    const filterDataByRange = (data, range) => {
        const now = new Date();
        let daysBack = 7;

        if (range === '30d') daysBack = 30;
        else if (range === '90d') daysBack = 90;

        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - daysBack);

        return data.filter(item => new Date(item.date) >= cutoffDate);
    };

    const filteredData = filterDataByRange(historyData, timeRange);

    
    const aqiSeries = [{
        name: 'AQI',
        data: filteredData.map(item => ({
            x: new Date(item.date).getTime(),
            y: item.aqi_om || item.aqi || 0
        }))
    }];

    const aqiOptions = {
        chart: {
            type: 'area',
            height: 300,
            toolbar: { show: true },
            zoom: { enabled: true }
        },
        colors: ['#9333ea'],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM \'yy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            }
        },
        yaxis: {
            title: { text: 'AQI Value' },
            labels: {
                formatter: (val) => val.toFixed(0)
            }
        },
        tooltip: {
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => `${val.toFixed(0)} AQI`
            }
        },
        grid: {
            borderColor: '#e2e8f0'
        },
        annotations: {
            yaxis: [
                {
                    y: 50,
                    borderColor: '#22c55e',
                    label: {
                        text: 'Good',
                        style: { color: '#fff', background: '#22c55e' }
                    }
                },
                {
                    y: 100,
                    borderColor: '#eab308',
                    label: {
                        text: 'Moderate',
                        style: { color: '#fff', background: '#eab308' }
                    }
                },
                {
                    y: 150,
                    borderColor: '#f97316',
                    label: {
                        text: 'Unhealthy',
                        style: { color: '#fff', background: '#f97316' }
                    }
                }
            ]
        }
    };

    
    const pollutantSeries = [
        {
            name: 'PM2.5',
            data: filteredData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.pm25 || 0
            }))
        },
        {
            name: 'PM10',
            data: filteredData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.pm10 || 0
            }))
        },
        {
            name: 'O₃',
            data: filteredData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.o3 || 0
            }))
        },
        {
            name: 'NO₂',
            data: filteredData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.no2 || 0
            }))
        }
    ];

    const pollutantOptions = {
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: true },
            zoom: { enabled: true }
        },
        colors: ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6'],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        xaxis: {
            type: 'datetime',
            labels: {
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM \'yy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            }
        },
        yaxis: {
            title: { text: 'Concentration (µg/m³)' },
            labels: {
                formatter: (val) => val.toFixed(1)
            }
        },
        tooltip: {
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (val) => `${val.toFixed(1)} µg/m³`
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

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Air Quality Trends
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('7d')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '7d'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setTimeRange('30d')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '30d'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        30 Days
                    </button>
                    <button
                        onClick={() => setTimeRange('90d')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '90d'
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        90 Days
                    </button>
                </div>
            </div>

            {}
            <div className="mb-8">
                <h4 className="text-md font-semibold text-slate-700 mb-3">Historical AQI Pattern</h4>
                <Chart
                    options={aqiOptions}
                    series={aqiSeries}
                    type="area"
                    height={300}
                />
            </div>

            {}
            <div>
                <h4 className="text-md font-semibold text-slate-700 mb-3">Pollutant Concentrations</h4>
                <Chart
                    options={pollutantOptions}
                    series={pollutantSeries}
                    type="line"
                    height={350}
                />
            </div>

            {}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-2 font-semibold">AQI Categories:</p>
                <div className="flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>0-50 Good</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>51-100 Moderate</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>101-150 Unhealthy (Sensitive)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>151-200 Unhealthy</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>201-300 Very Unhealthy</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-rose-900"></div>
                        <span>300+ Hazardous</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PollutantTrends;

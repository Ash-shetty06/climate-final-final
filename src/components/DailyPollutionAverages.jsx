import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { BarChart3 } from 'lucide-react';

const DailyPollutionAverages = ({ historyData }) => {
    const [timeRange, setTimeRange] = useState('7d');

    if (!historyData || historyData.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Daily Pollution Averages
                </h3>
                <p className="text-slate-500">Loading pollution data...</p>
            </div>
        );
    }

    
    const filterDataByRange = (data, range) => {
        const now = new Date();
        let daysBack = 7;

        if (range === '30d') daysBack = 30;

        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - daysBack);

        return data.filter(item => new Date(item.date) >= cutoffDate);
    };

    const filteredData = filterDataByRange(historyData, timeRange);

    
    const categories = filteredData.map(item =>
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const series = [
        {
            name: 'PM2.5',
            data: filteredData.map(item => item.pm25 || 0)
        },
        {
            name: 'PM10',
            data: filteredData.map(item => item.pm10 || 0)
        },
        {
            name: 'O₃',
            data: filteredData.map(item => item.o3 || 0)
        },
        {
            name: 'NO₂',
            data: filteredData.map(item => item.no2 || 0)
        }
    ];

    const options = {
        chart: {
            type: 'bar',
            height: 350,
            stacked: false,
            toolbar: { show: true }
        },
        colors: ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '70%',
                borderRadius: 4
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: categories,
            labels: {
                rotate: -45,
                rotateAlways: true
            }
        },
        yaxis: {
            title: {
                text: 'Concentration (µg/m³)'
            },
            labels: {
                formatter: (val) => val.toFixed(0)
            }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: (val) => val.toFixed(1) + ' µg/m³'
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

    
    const calculateAverage = (pollutant) => {
        const values = filteredData.map(item => item[pollutant] || 0).filter(v => v > 0);
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    };

    const avgPM25 = calculateAverage('pm25');
    const avgPM10 = calculateAverage('pm10');
    const avgO3 = calculateAverage('o3');
    const avgNO2 = calculateAverage('no2');

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Daily Pollution Averages
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('7d')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '7d'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        7 Days
                    </button>
                    <button
                        onClick={() => setTimeRange('30d')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${timeRange === '30d'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        30 Days
                    </button>
                </div>
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-xs text-red-600 mb-1">Avg PM2.5</div>
                    <div className="text-xl font-bold text-red-900">{avgPM25.toFixed(1)}</div>
                    <div className="text-xs text-red-600">µg/m³</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-xs text-orange-600 mb-1">Avg PM10</div>
                    <div className="text-xl font-bold text-orange-900">{avgPM10.toFixed(1)}</div>
                    <div className="text-xs text-orange-600">µg/m³</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-600 mb-1">Avg O₃</div>
                    <div className="text-xl font-bold text-blue-900">{avgO3.toFixed(1)}</div>
                    <div className="text-xs text-blue-600">µg/m³</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 mb-1">Avg NO₂</div>
                    <div className="text-xl font-bold text-purple-900">{avgNO2.toFixed(1)}</div>
                    <div className="text-xs text-purple-600">µg/m³</div>
                </div>
            </div>

            {}
            <Chart
                options={options}
                series={series}
                type="bar"
                height={350}
            />
        </div>
    );
};

export default DailyPollutionAverages;

import React, { useState, useEffect, useRef } from 'react';
import { CITIES } from '../utils/constants';
import Chart from 'react-apexcharts';
import DownloadDataButtons from '../components/DownloadDataButtons';
import PollutantTrends from '../components/PollutantTrends';
import DailyPollutionAverages from '../components/DailyPollutionAverages';
import { fetchHistoricalData, searchCities } from '../services/weatherApi';
import { Search, MapPin, TrendingUp, TrendingDown, Thermometer } from 'lucide-react';

const HistoricalPage = () => {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [timeRange, setTimeRange] = useState('1yr');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);


  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);


      if (timeRange === '24h' || timeRange === '7d') {
        const [hourly, daily] = await Promise.all([
          fetchHourlyForecast(selectedCity.lat, selectedCity.lon),
          fetchDailyForecast(selectedCity.lat, selectedCity.lon)
        ]);

        setHourlyForecast(hourly);
        setDailyForecast(daily);


        if (timeRange === '24h' && hourly) {
          const forecastData = hourly.time.map((time, idx) => ({
            date: time,
            temp_om: hourly.temperature_2m[idx],
            temp_vc: null,
            aqi_om: null,
            aqi_vc: null,
            rain_om: null,
            rain_vc: null
          }));
          setHistoricalData(forecastData);
        } else if (timeRange === '7d' && daily) {
          const forecastData = daily.time.map((time, idx) => ({
            date: time,
            temp_om: (daily.temperature_2m_max[idx] + daily.temperature_2m_min[idx]) / 2,
            temp_vc: null,
            aqi_om: daily.european_aqi ? daily.european_aqi[idx] : null,
            aqi_vc: null,
            rain_om: daily.precipitation_sum ? daily.precipitation_sum[idx] : null,
            rain_vc: null
          }));
          setHistoricalData(forecastData);
        }

        setLoading(false);
        return;
      }


      const endDate = new Date();
      const startDate = new Date();

      if (timeRange === '30d') {
        startDate.setDate(endDate.getDate() - 30);
      } else if (timeRange === '90d') {
        startDate.setDate(endDate.getDate() - 90);
      } else if (timeRange === '1yr') {
        startDate.setFullYear(endDate.getFullYear() - 1);
      } else if (timeRange === '5yr') {
        startDate.setFullYear(endDate.getFullYear() - 5);
      } else if (timeRange === '10yr') {
        startDate.setFullYear(endDate.getFullYear() - 10);
      }

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      console.log(`Loading data for ${selectedCity.name} (${selectedCity.lat}, ${selectedCity.lon})`);

      const data = await fetchHistoricalData(
        selectedCity.lat,
        selectedCity.lon,
        formattedStartDate,
        formattedEndDate
      );

      if (data.length === 0) {
        setError('No data available for the selected time range. Try a different time period or city.');
      }

      setHistoricalData(data);


      const [hourly, daily] = await Promise.all([
        fetchHourlyForecast(selectedCity.lat, selectedCity.lon),
        fetchDailyForecast(selectedCity.lat, selectedCity.lon)
      ]);

      setHourlyForecast(hourly);
      setDailyForecast(daily);

      setLoading(false);
    };

    loadData();
  }, [selectedCity, timeRange]);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchCities(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const selectCity = (city) => {
    setSelectedCity(city);
    setSearchQuery('');
    setSearchResults([]);
  };


  const vcFailed = historicalData.length > 0 && historicalData.every(d => d.temp_vc === null);


  const dates = historicalData.map(d => d.date);

  const tempSeries = [
    { name: 'Temp (Open-Meteo)', data: historicalData.map(d => ({ x: d.date, y: d.temp_om })) },
    { name: 'Temp (Visual Crossing)', data: historicalData.map(d => ({ x: d.date, y: d.temp_vc })) }
  ];

  const aqiSeries = [
    { name: 'AQI (Open-Meteo)', data: historicalData.map(d => ({ x: d.date, y: d.aqi_om })) },
    { name: 'AQI (Visual Crossing)', data: historicalData.map(d => ({ x: d.date, y: d.aqi_vc })) }
  ];

  const rainSeries = [
    { name: 'Rain (Open-Meteo)', data: historicalData.map(d => ({ x: d.date, y: d.rain_om })) },
    { name: 'Rain (Visual Crossing)', data: historicalData.map(d => ({ x: d.date, y: d.rain_vc })) }
  ];


  const commonOptions = {
    chart: {
      zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
      toolbar: {
        show: true,
        autoSelected: 'zoom',
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: true,
          zoomout: true,
          pan: false,
          reset: true
        }
      },
      width: '100%',
      animations: {
        enabled: false
      },
      redrawOnParentResize: true,
      redrawOnWindowResize: true
    },
    xaxis: {
      type: 'datetime',
      labels: { format: 'dd MMM yyyy' },
      tooltip: { enabled: false }
    },
    tooltip: { x: { format: 'dd MMM yyyy' } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#f1f1f1' },
    legend: { position: 'top' }
  };

  const tempOptions = {
    ...commonOptions,
    chart: { ...commonOptions.chart, id: 'temp-chart', type: 'line' },
    colors: ['#f97316', '#8b5cf6'],
    yaxis: {
      title: { text: 'Temperature (°C)' },
      labels: { formatter: (val) => val ? val.toFixed(1) : val }
    }
  };

  const aqiOptions = {
    ...commonOptions,
    chart: {
      ...commonOptions.chart,
      id: 'aqi-chart',
      type: timeRange === '7d' || timeRange === '30d' || timeRange === '90d' ? 'area' : 'line'
    },
    colors: ['#9333ea'],
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: timeRange === '7d' || timeRange === '30d' || timeRange === '90d' ? {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      }
    } : {},
    yaxis: {
      title: { text: 'AQI' },
      labels: { formatter: (val) => val ? val.toFixed(0) : val }
    },

    ...(timeRange === '7d' || timeRange === '30d' || timeRange === '90d' ? {
      annotations: {
        yaxis: [
          {
            y: 50,
            borderColor: '#22c55e',
            label: {
              text: 'Good',
              style: { color: '#fff', background: '#22c55e', fontSize: '11px', fontWeight: 600 }
            }
          },
          {
            y: 100,
            borderColor: '#eab308',
            label: {
              text: 'Moderate',
              style: { color: '#fff', background: '#eab308', fontSize: '11px', fontWeight: 600 }
            }
          },
          {
            y: 150,
            borderColor: '#f97316',
            label: {
              text: 'Unhealthy',
              style: { color: '#fff', background: '#f97316', fontSize: '11px', fontWeight: 600 }
            }
          }
        ]
      }
    } : {})
  };

  const rainOptions = {
    ...commonOptions,
    chart: { ...commonOptions.chart, id: 'rain-chart', type: 'line' },
    colors: ['#3b82f6', '#6366f1'],
    yaxis: {
      title: { text: 'Rainfall (mm)' },
      labels: { formatter: (val) => val ? val.toFixed(1) : val }
    },
    stroke: { curve: 'straight', width: 2 }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Historical Climate Trends</h1>
        <DownloadDataButtons city={selectedCity} historicalData={historicalData} />
      </div>

      {vcFailed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="text-yellow-600 mt-1">⚠️</div>
          <div>
            <h4 className="font-semibold text-yellow-800">Visual Crossing Limit Reached</h4>
            <p className="text-sm text-yellow-700">
              The Visual Crossing API (Source 2) responded with an error (likely 429 Too Many Requests).
              The free tier allows 1000 records/day. Fetching 1 year of data consumes ~365 records.
              Please wait for the daily reset or switch to a shorter time range.
              <br />
              <strong>Showing Open-Meteo data only.</strong>
            </p>
          </div>
        </div>
      )}

      { }
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col gap-2 w-full sm:w-1/3 relative">
          <label className="text-sm font-semibold text-slate-600">Search City (India)</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 pl-10 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            {isSearching && (
              <div className="absolute right-3 top-3.5 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
          </div>

          { }
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((city) => (
                <button
                  key={city.id}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-slate-50 last:border-0"
                  onClick={() => selectCity(city)}
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-800">{city.name}</div>
                    <div className="text-xs text-slate-500">{city.state}, {city.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-2 text-sm text-slate-500">
            Selected: <span className="font-semibold text-blue-600">{selectedCity.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-1/3">
          <label className="text-sm font-semibold text-slate-600">Time Range</label>
          <select
            className="p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none hover:border-blue-400 transition-colors"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1yr">Last 1 Year</option>
            <option value="5yr">Last 5 Years</option>
            <option value="10yr">Last 10 Years</option>
          </select>
        </div>
      </div>

      { }
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <p className="text-sm text-red-500 mt-2">Check the browser console for more details.</p>
        </div>
      ) : historicalData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          { }
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <h3 className="font-bold text-lg text-slate-800 mb-2 px-2">Temperature Trend (°C)</h3>
            <div className="w-full h-[350px]">
              <Chart key={`temp-${timeRange}-${historicalData.length}`} options={tempOptions} series={tempSeries} type="line" height={350} />
            </div>
          </div>

          { }
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <h3 className="font-bold text-lg text-slate-800 mb-2 px-2">AQI Trend (Est.)</h3>
            <div className="w-full h-[350px]">
              <Chart key={`aqi-${timeRange}-${historicalData.length}`} options={aqiOptions} series={aqiSeries} type={timeRange === '7d' || timeRange === '30d' || timeRange === '90d' ? 'area' : 'line'} height={350} />
            </div>
          </div>

          { }
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 hover:shadow-md transition-all">
            <h3 className="font-bold text-lg text-slate-800 mb-2 px-2">Rainfall Trend (mm)</h3>
            <div className="w-full h-[350px]">
              <Chart key={`rain-${timeRange}-${historicalData.length}`} options={rainOptions} series={rainSeries} type="line" height={350} />
            </div>
          </div>

          {/* Pollutant Trends Analysis */}
          <div className="lg:col-span-2">
            <PollutantTrends historyData={historicalData} />
          </div>

          {/* Daily Pollution Averages */}
          <div className="lg:col-span-2">
            <DailyPollutionAverages historyData={historicalData} />
          </div>
        </div>
      ) : (
        <div className="text-center p-10 text-slate-500">
          No data available to display charts.
        </div>
      )}
    </div>
  );
};

export default HistoricalPage;

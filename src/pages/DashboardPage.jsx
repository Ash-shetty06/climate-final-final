import React, { useState, useEffect, useMemo } from 'react';
import { CITIES } from '../utils/constants';
import { Droplets, Wind, Thermometer, CloudRain, GaugeCircle, CloudSun, Sun, Sunrise, Sunset, Eye, Cloud } from 'lucide-react';
import IndiaMapSelector from '../components/IndiaMapSelector';
import SummaryCard from '../components/SummaryCard';
import WeatherAlerts from '../components/WeatherAlerts';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import SourceModal from '../components/SourceModal';
import InsightsPanel from '../components/InsightsPanel';
import { fetchCurrentWeather, fetchCurrentAQI, fetchMetNorwayWeather, fetchWaqiFeed, fetchHourlyForecast, fetchDailyForecast } from '../services/weatherApi';
import { generateAlerts } from '../utils/weatherUtils';

const DashboardPage = () => {
  const [selectedCityId, setSelectedCityId] = useState('bengaluru');
  const [clickedCoord, setClickedCoord] = useState(null);


  const defaultCity = CITIES.find(c => c.id === 'bengaluru') || CITIES[0];
  const [currentLocation, setCurrentLocation] = useState({
    name: defaultCity.name,
    lat: defaultCity.lat,
    lon: defaultCity.lon
  });

  const [weatherData, setWeatherData] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [metData, setMetData] = useState(null);
  const [waqiData, setWaqiData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState(null);
  const [dailyForecast, setDailyForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {

        const [weather, aqi, met, waqi, hourly, daily] = await Promise.all([
          fetchCurrentWeather(currentLocation.lat, currentLocation.lon),
          fetchCurrentAQI(currentLocation.lat, currentLocation.lon),
          fetchMetNorwayWeather(currentLocation.lat, currentLocation.lon),
          fetchWaqiFeed(currentLocation.lat, currentLocation.lon),
          fetchHourlyForecast(currentLocation.lat, currentLocation.lon),
          fetchDailyForecast(currentLocation.lat, currentLocation.lon)
        ]);

        setWeatherData(weather);
        setAqiData(aqi);
        setMetData(met);
        setWaqiData(waqi);
        setHourlyForecast(hourly);
        setDailyForecast(daily);


        const newAlerts = generateAlerts(weather, aqi, { daily });
        setAlerts(newAlerts);


        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        const history = await fetchHistoricalData(
          currentLocation.lat,
          currentLocation.lon,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        setHistoryData(history);

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentLocation]);

  const getAQIStatus = (aqi) => {
    if (!aqi) return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    if (aqi <= 50) return { label: 'Good', color: 'bg-green-100 text-green-800 border-green-200' };
    if (aqi <= 100) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (aqi <= 200) return { label: 'Unhealthy', color: 'bg-red-100 text-red-800 border-red-200' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    return { label: 'Hazardous', color: 'bg-rose-950 text-rose-100 border-rose-900' };
  };

  const aqiStatus = getAQIStatus(aqiData?.aqi);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMetric, setModalMetric] = useState(null);

  const openModal = (metric) => {
    setModalMetric(metric);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setModalMetric(null);
  };



  const enrichedCityData = useMemo(() => {
    if (!weatherData || !aqiData) return { ...currentLocation, id: 'custom' };


    const weatherSources = [
      { source: 'Open-Meteo', ...weatherData }
    ];
    if (metData) {
      weatherSources.push({ source: 'MET Norway', ...metData });
    }


    const aqiSources = [
      { source: 'Open-Meteo', ...aqiData }
    ];
    if (waqiData) {
      aqiSources.push({ source: waqiData.source, ...waqiData });
    }

    return {
      ...currentLocation,
      id: selectedCityId || 'custom',
      weather: weatherSources,
      aqi: aqiSources
    };
  }, [currentLocation, selectedCityId, weatherData, aqiData, metData, waqiData]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">

      { }
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CloudSun className="w-8 h-8 text-blue-500" />
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Showing real-time data for <span className="font-bold text-blue-700">{currentLocation.name}</span> (selected from map)
          </p>
        </div>
      </div>

      { }
      <WeatherAlerts alerts={alerts} />

      { }
      <HourlyForecast data={hourlyForecast} />

      { }
      <DailyForecast data={dailyForecast} />

      { }
      <section className="bg-white rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          Current Weather & Metrics
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>}
        </h2>

        { }
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <SummaryCard
            title="Temperature"
            value={weatherData?.temp?.toFixed(1) || '--'}
            unit="°C"
            subtitle="Current Temp"
            onClick={() => openModal('temp')}
            icon={<Thermometer className="text-orange-500" />}
          />
          <SummaryCard
            title="Feels Like"
            value={weatherData?.feelsLike?.toFixed(1) || '--'}
            unit="°C"
            subtitle="Apparent Temp"
            icon={<Thermometer className="text-orange-400" />}
          />
          <SummaryCard
            title="AQI"
            value={aqiData?.aqi || '--'}
            unit=""
            subtitle="Air Quality"
            onClick={() => openModal('aqi')}
            icon={<GaugeCircle className="text-green-600" />}
          />
          <SummaryCard
            title="Humidity"
            value={weatherData?.humidity || '--'}
            unit="%"
            subtitle="Relative Humidity"
            onClick={() => openModal('humidity')}
            icon={<Droplets className="text-blue-500" />}
          />
          <SummaryCard
            title="Wind"
            value={weatherData?.windSpeed?.toFixed(1) || '--'}
            unit=" km/h"
            subtitle="Wind Speed"
            onClick={() => openModal('wind')}
            icon={<Wind className="text-teal-600" />}
          />
        </div>

        { }
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="UV Index"
            value={weatherData?.uvIndex?.toFixed(0) || '--'}
            unit=""
            subtitle={weatherData?.uvIndex > 8 ? 'Very High' : weatherData?.uvIndex > 6 ? 'High' : weatherData?.uvIndex > 3 ? 'Moderate' : 'Low'}
            onClick={() => openModal('uv')}
            icon={<Sun className="text-yellow-500" />}
          />
          <SummaryCard
            title="Pressure"
            value={weatherData?.pressure?.toFixed(0) || '--'}
            unit=" hPa"
            subtitle={weatherData?.pressure > 1020 ? 'High ↑' : weatherData?.pressure < 1010 ? 'Low ↓' : 'Normal →'}
            onClick={() => openModal('pressure')}
            icon={<GaugeCircle className="text-blue-500" />}
          />
          <SummaryCard
            title="Sunrise"
            value={weatherData?.sunrise ? new Date(weatherData.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}
            unit=""
            subtitle="Local time"
            onClick={() => openModal('sunrise')}
            icon={<Sunrise className="text-amber-500" />}
          />
          <SummaryCard
            title="Sunset"
            value={weatherData?.sunset ? new Date(weatherData.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}
            unit=""
            subtitle="Local time"
            onClick={() => openModal('sunset')}
            icon={<Sunset className="text-orange-600" />}
          />
          <SummaryCard
            title="Visibility"
            value={weatherData?.visibility?.toFixed(1) || '--'}
            unit=" km"
            subtitle="Clear view distance"
            onClick={() => openModal('visibility')}
            icon={<Eye className="text-slate-500" />}
          />
          <SummaryCard
            title="Cloud Cover"
            value={weatherData?.cloudCover || '--'}
            unit="%"
            subtitle="Sky coverage"
            onClick={() => openModal('cloud')}
            icon={<Cloud className="text-slate-400" />}
          />
          <SummaryCard
            title="Rain Prob"
            value={weatherData?.rainProb || 0}
            unit="%"
            subtitle="Precipitation chance"
            onClick={() => openModal('rain')}
            icon={<CloudRain className="text-purple-500" />}
          />
        </div>
      </section>









      { }
      <section className="bg-white rounded-2xl p-0">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Location & Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Select Location</h3>
            <IndiaMapSelector
              selectedCityId={selectedCityId}
              onCitySelect={(id) => {
                setSelectedCityId(id);
                const city = CITIES.find(c => c.id === id);
                if (city) {
                  setCurrentLocation({ name: city.name, lat: city.lat, lon: city.lon });
                }
              }}
              onLocationSelect={(lat, lon, nearestId) => {
                setClickedCoord({ lat, lon });
                if (nearestId) {
                  setSelectedCityId(nearestId);
                  const city = CITIES.find(c => c.id === nearestId);
                  if (city) {
                    setCurrentLocation({ name: city.name, lat: city.lat, lon: city.lon });
                  }
                } else {
                  setSelectedCityId(null);
                  setCurrentLocation({ name: 'Custom Location', lat, lon });
                }
              }}
            />
            {clickedCoord && (
              <div className="mt-2 text-xs text-slate-600 px-2">
                Clicked coords: <span className="font-medium">{clickedCoord.lat.toFixed(5)}</span>, <span className="font-medium">{clickedCoord.lon.toFixed(5)}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <InsightsPanel
                  todayTemp={weatherData?.temp}
                  todayAQI={aqiData?.aqi}
                  history={historyData}
                />

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-sm font-medium text-slate-700">Current AQI Status</div>
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-bold border ${aqiStatus.color}`}>{aqiStatus.label}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      { }
      <SourceModal isOpen={isModalOpen} metric={modalMetric} city={enrichedCityData} onClose={closeModal} />
    </div >
  );
};

export default DashboardPage;

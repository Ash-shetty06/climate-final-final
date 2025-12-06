import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CITIES } from '../utils/constants';
import { Droplets, Wind, Thermometer, CloudRain, GaugeCircle, CloudSun, Sun, Sunrise, Sunset, Eye, Cloud, Search, Heart, MapPin } from 'lucide-react';
import IndiaMapSelector from '../components/IndiaMapSelector';
import SummaryCard from '../components/SummaryCard';
import WeatherAlerts from '../components/WeatherAlerts';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import SourceModal from '../components/SourceModal';
import HealthAdvicePanel from '../components/HealthAdvicePanel';
import { fetchCurrentWeather, fetchCurrentAQI, fetchMetNorwayWeather, fetchWaqiFeed, fetchHourlyForecast, fetchDailyForecast, searchCities, fetchHistoricalData } from '../services/weatherApi';
import { generateAlerts } from '../utils/weatherUtils';
import { addFavorite, removeFavorite, getCurrentUser, isAuthenticated } from '../services/authService';

const DashboardPage = () => {
  const [selectedCityId, setSelectedCityId] = useState('bengaluru');
  const [clickedCoord, setClickedCoord] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  const [user, setUser] = useState(getCurrentUser());
  const [favorites, setFavorites] = useState(user?.favoriteCities || []);

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

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    // Debounce could be good, but direct call for now
    const results = await searchCities(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectCity = (city) => {
    setCurrentLocation({
      name: city.name,
      lat: city.lat,
      lon: city.lon
    });

    // Check if it's one of our predefined cities to highlight on map
    const predefinedCity = CITIES.find(c => c.name.toLowerCase() === city.name.toLowerCase());
    if (predefinedCity) {
      setSelectedCityId(predefinedCity.id);
    } else {
      setSelectedCityId(null); // Custom location
    }

    setSearchQuery('');
    setShowDropdown(false);
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated()) {
      alert('Please login to save favorites!');
      return;
    }

    const isFav = favorites.some(fav => fav.name === currentLocation.name);

    try {
      if (isFav) {
        const fav = favorites.find(f => f.name === currentLocation.name);
        if (fav) {
          await removeFavorite(fav.cityId || 'custom');
          const updatedUser = getCurrentUser();
          setFavorites(updatedUser.favoriteCities);
          setUser(updatedUser);
        }
      } else {
        const cityData = {
          cityId: selectedCityId || `custom-${Date.now()}`,
          name: currentLocation.name,
          lat: currentLocation.lat,
          lon: currentLocation.lon
        };
        await addFavorite(cityData);
        const updatedUser = getCurrentUser();
        setFavorites(updatedUser.favoriteCities);
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Fav error', err);
    }
  };

  const isCurrentFavorite = favorites.some(fav => fav.name === currentLocation.name);

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
    weatherSources.push({
      source: 'MET Norway',
      ...(metData || { temp: '--', humidity: '--', windSpeed: '--', lastUpdated: 'Unavailable' })
    });

    const aqiSources = [
      { source: 'Open-Meteo', ...aqiData }
    ];
    aqiSources.push({
      source: waqiData?.source || 'WAQI (aqicn.org)',
      ...(waqiData || { aqi: '--', pm25: '--', pm10: '--', lastUpdated: 'Unavailable' })
    });

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
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CloudSun className="w-8 h-8 text-blue-500" />
            Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-500">
              Weather for <span className="font-bold text-blue-700 text-lg">{currentLocation.name}</span>
            </p>
            <button onClick={toggleFavorite} className="focus:outline-none transition-transform hover:scale-110">
              <Heart className={`w-6 h-6 ${isCurrentFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Search Bar & Favorites Dropdown */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 relative">
          <div className="relative w-full sm:w-80" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search city (e.g. Mumbai, Tokyo)..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => { if (searchQuery.length >= 2) setShowDropdown(true); }}
            />

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {isSearching ? (
                  <div className="px-4 py-2 text-slate-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((city) => (
                    <div
                      key={city.id}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-slate-900"
                      onClick={() => handleSelectCity(city)}
                    >
                      <span className="block truncate font-medium">{city.name}</span>
                      <span className="block truncate text-xs text-slate-500">{city.state ? `${city.state}, ` : ''}{city.country}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-slate-500">No cities found</div>
                )}
              </div>
            )}
          </div>

          {/* Favorites List */}
          {favorites.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 max-w-full lg:max-w-xs scrollbar-hide">
              {favorites.map(fav => (
                <button
                  key={fav.cityId + fav.name}
                  onClick={() => handleSelectCity(fav)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full border border-red-100 whitespace-nowrap hover:bg-red-100"
                >
                  <Heart className="w-3 h-3 fill-red-500" />
                  {fav.name}
                </button>
              ))}
            </div>
          )}
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
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-sm font-medium text-slate-700">Current AQI Status</div>
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-bold border ${aqiStatus.color}`}>{aqiStatus.label}</div>
                </div>

                <HealthAdvicePanel
                  aqi={aqiData?.aqi}
                  temp={weatherData?.temp}
                  humidity={weatherData?.humidity}
                />
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

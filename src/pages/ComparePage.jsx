import React, { useState, useEffect, useRef } from 'react';
import { CITIES } from '../utils/constants';
import { fetchCurrentWeather, fetchCurrentAQI, searchCities } from '../services/weatherApi';
import { Search, MapPin, ArrowRight, Thermometer, Wind, Droplets, Activity } from 'lucide-react';

const ComparePage = () => {
  
  const defaultCityA = CITIES.find(c => c.id === 'bengaluru') || CITIES[0];
  const defaultCityB = CITIES.find(c => c.id === 'delhi') || CITIES[1];

  const [cityA, setCityA] = useState(defaultCityA);
  const [cityB, setCityB] = useState(defaultCityB);
  const [dataA, setDataA] = useState({ weather: null, aqi: null, loading: true });
  const [dataB, setDataB] = useState({ weather: null, aqi: null, loading: true });

  
  const [searchQueryA, setSearchQueryA] = useState('');
  const [searchResultsA, setSearchResultsA] = useState([]);
  const [isSearchingA, setIsSearchingA] = useState(false);
  const searchTimeoutA = useRef(null);

  
  const [searchQueryB, setSearchQueryB] = useState('');
  const [searchResultsB, setSearchResultsB] = useState([]);
  const [isSearchingB, setIsSearchingB] = useState(false);
  const searchTimeoutB = useRef(null);

  
  useEffect(() => {
    const fetchData = async () => {
      setDataA(prev => ({ ...prev, loading: true }));
      try {
        const [weather, aqi] = await Promise.all([
          fetchCurrentWeather(cityA.lat, cityA.lon),
          fetchCurrentAQI(cityA.lat, cityA.lon)
        ]);
        setDataA({ weather, aqi, loading: false });
      } catch (error) {
        console.error("Error fetching data for City A", error);
        setDataA({ weather: null, aqi: null, loading: false });
      }
    };
    fetchData();
  }, [cityA]);

  
  useEffect(() => {
    const fetchData = async () => {
      setDataB(prev => ({ ...prev, loading: true }));
      try {
        const [weather, aqi] = await Promise.all([
          fetchCurrentWeather(cityB.lat, cityB.lon),
          fetchCurrentAQI(cityB.lat, cityB.lon)
        ]);
        setDataB({ weather, aqi, loading: false });
      } catch (error) {
        console.error("Error fetching data for City B", error);
        setDataB({ weather: null, aqi: null, loading: false });
      }
    };
    fetchData();
  }, [cityB]);

  
  const handleSearchA = (e) => {
    const query = e.target.value;
    setSearchQueryA(query);

    if (searchTimeoutA.current) clearTimeout(searchTimeoutA.current);

    if (query.length < 2) {
      setSearchResultsA([]);
      return;
    }

    setIsSearchingA(true);
    searchTimeoutA.current = setTimeout(async () => {
      const results = await searchCities(query);
      setSearchResultsA(results);
      setIsSearchingA(false);
    }, 500);
  };

  const selectCityA = (city) => {
    setCityA(city);
    setSearchQueryA('');
    setSearchResultsA([]);
  };

  
  const handleSearchB = (e) => {
    const query = e.target.value;
    setSearchQueryB(query);

    if (searchTimeoutB.current) clearTimeout(searchTimeoutB.current);

    if (query.length < 2) {
      setSearchResultsB([]);
      return;
    }

    setIsSearchingB(true);
    searchTimeoutB.current = setTimeout(async () => {
      const results = await searchCities(query);
      setSearchResultsB(results);
      setIsSearchingB(false);
    }, 500);
  };

  const selectCityB = (city) => {
    setCityB(city);
    setSearchQueryB('');
    setSearchResultsB([]);
  };

  const isLoading = dataA.loading || dataB.loading;

  
  const tempDiff = (dataA.weather && dataB.weather)
    ? (dataB.weather.temp - dataA.weather.temp).toFixed(1)
    : null;

  const aqiDiff = (dataA.aqi && dataB.aqi)
    ? dataB.aqi.aqi - dataA.aqi.aqi
    : null;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Compare Cities</h1>

      {}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
        {}
        <div className="w-full md:w-80">
          <label className="block text-sm font-semibold text-slate-600 mb-2">City A</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 pl-10 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search Indian city..."
              value={searchQueryA}
              onChange={handleSearchA}
            />
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            {isSearchingA && (
              <div className="absolute right-3 top-3.5 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}

            {}
            {searchResultsA.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResultsA.map((city) => (
                  <button
                    key={city.id}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-slate-50 last:border-0"
                    onClick={() => selectCityA(city)}
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
              Selected: <span className="font-semibold text-blue-600">{cityA.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 p-2 rounded-full mt-6">
          <ArrowRight className="text-slate-400" />
        </div>

        {}
        <div className="w-full md:w-80">
          <label className="block text-sm font-semibold text-slate-600 mb-2">City B</label>
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 pl-10 border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Search Indian city..."
              value={searchQueryB}
              onChange={handleSearchB}
            />
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            {isSearchingB && (
              <div className="absolute right-3 top-3.5 animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
            )}

            {}
            {searchResultsB.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResultsB.map((city) => (
                  <button
                    key={city.id}
                    className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-2 transition-colors border-b border-slate-50 last:border-0"
                    onClick={() => selectCityB(city)}
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
              Selected: <span className="font-semibold text-purple-600">{cityB.name}</span>
            </div>
          </div>
        </div>
      </div>

      {}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 hidden md:block -translate-x-1/2"></div>

          {}
          <ComparisonCard city={cityA} weather={dataA.weather} aqi={dataA.aqi} />

          {}
          <ComparisonCard city={cityB} weather={dataB.weather} aqi={dataB.aqi} />
        </div>
      )}

      {}
      {!isLoading && dataA.weather && dataB.weather && dataA.aqi && dataB.aqi && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 max-w-3xl mx-auto text-center">
          <h3 className="text-blue-900 font-bold text-lg mb-4">Comparison Insight</h3>
          <div className="flex flex-col gap-2 text-blue-800">
            <p>
              {Number(tempDiff) > 0
                ? `${cityB.name} is ${tempDiff}°C hotter than ${cityA.name}.`
                : `${cityB.name} is ${Math.abs(Number(tempDiff))}°C cooler than ${cityA.name}.`}
            </p>
            <p>
              {aqiDiff > 0
                ? `${cityB.name} has worse air quality (+${aqiDiff} AQI points) compared to ${cityA.name}.`
                : `${cityB.name} has better air quality (${Math.abs(aqiDiff)} AQI points) compared to ${cityA.name}.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonCard = ({ city, weather, aqi }) => {
  if (!weather || !aqi) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md h-full flex items-center justify-center">
        <p className="text-slate-500">Data unavailable for {city.name}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b pb-4">{city.name}</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Thermometer className="text-orange-500 w-6 h-6" />
            <span className="text-slate-600 font-medium">Temperature</span>
          </div>
          <span className="text-xl font-bold text-slate-800">{weather.temp}°C</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="text-blue-500 w-6 h-6" />
            <span className="text-slate-600 font-medium">Humidity</span>
          </div>
          <span className="text-xl font-bold text-slate-800">{weather.humidity}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wind className="text-slate-500 w-6 h-6" />
            <span className="text-slate-600 font-medium">Wind</span>
          </div>
          <span className="text-xl font-bold text-slate-800">{weather.windSpeed} km/h</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-500 w-6 h-6" />
            <span className="text-slate-600 font-medium">AQI</span>
          </div>
          <span className="text-xl font-bold text-slate-800">{aqi.aqi}</span>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-sm font-semibold text-slate-500 mb-3">Pollutants</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded">
              <span className="block text-xs text-slate-400">PM2.5</span>
              <span className="font-medium text-slate-700">{aqi.pm25}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="block text-xs text-slate-400">PM10</span>
              <span className="font-medium text-slate-700">{aqi.pm10}</span>
            </div>
            <div className="bg-slate-50 p-2 rounded">
              <span className="block text-xs text-slate-400">NO2</span>
              <span className="font-medium text-slate-700">{aqi.no2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;

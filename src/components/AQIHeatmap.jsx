import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { CITIES } from '../utils/constants';
import { fetchCurrentAQI } from '../services/weatherApi';
import { Map as MapIcon } from 'lucide-react';

function MapUpdater() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);
    return null;
}

const AQIHeatmap = () => {
    const [cityAQI, setCityAQI] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllCityAQI = async () => {
            setLoading(true);
            try {

                const aqiPromises = CITIES.map(async (city) => {
                    try {
                        const aqi = await fetchCurrentAQI(city.lat, city.lon);
                        return {
                            ...city,
                            aqi: aqi?.aqi || 0
                        };
                    } catch (error) {
                        console.error(`Error fetching AQI for ${city.name}:`, error);
                        return {
                            ...city,
                            aqi: 0
                        };
                    }
                });

                const results = await Promise.all(aqiPromises);
                setCityAQI(results);
            } catch (error) {
                console.error('Error fetching city AQI data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllCityAQI();
    }, []);


    const getAQIColor = (aqi) => {
        if (aqi <= 50) return '#22c55e';
        if (aqi <= 100) return '#eab308';
        if (aqi <= 150) return '#f97316';
        if (aqi <= 200) return '#ef4444';
        if (aqi <= 300) return '#a855f7';
        return '#881337';
    };


    const getAQICategory = (aqi) => {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy (Sensitive)';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    };


    const getMarkerSize = (aqi) => {
        if (aqi <= 50) return 15;
        if (aqi <= 100) return 20;
        if (aqi <= 150) return 25;
        if (aqi <= 200) return 30;
        if (aqi <= 300) return 35;
        return 40;
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MapIcon className="w-5 h-5 text-green-600" />
                    AQI Heatmap - Major Indian Cities
                </h3>
                {loading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                )}
            </div>

            { }
            <div className="h-[500px] rounded-lg overflow-hidden border border-slate-200 mb-4">
                <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <MapUpdater />

                    {cityAQI.map((city) => (
                        <CircleMarker
                            key={city.id}
                            center={[city.lat, city.lon]}
                            radius={getMarkerSize(city.aqi)}
                            fillColor={getAQIColor(city.aqi)}
                            color="#fff"
                            weight={2}
                            opacity={0.9}
                            fillOpacity={0.7}
                        >
                            <Popup>
                                <div className="text-center">
                                    <h4 className="font-bold text-slate-900 mb-1">{city.name}</h4>
                                    <div className="text-2xl font-bold mb-1" style={{ color: getAQIColor(city.aqi) }}>
                                        {city.aqi}
                                    </div>
                                    <div className="text-xs text-slate-600">{getAQICategory(city.aqi)}</div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            { }
            <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">AQI Color Scale</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                        <span className="text-xs text-slate-600">0-50 Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                        <span className="text-xs text-slate-600">51-100 Moderate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
                        <span className="text-xs text-slate-600">101-150 Unhealthy (S)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                        <span className="text-xs text-slate-600">151-200 Unhealthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#a855f7' }}></div>
                        <span className="text-xs text-slate-600">201-300 Very Unhealthy</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#881337' }}></div>
                        <span className="text-xs text-slate-600">300+ Hazardous</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                    * Circle size indicates AQI severity. Larger circles = higher pollution levels.
                </p>
            </div>

            { }
            <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Current AQI by City</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {cityAQI
                        .sort((a, b) => b.aqi - a.aqi)
                        .map((city) => (
                            <div
                                key={city.id}
                                className="flex items-center justify-between bg-slate-50 rounded-lg p-2 hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-sm text-slate-700">{city.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold" style={{ color: getAQIColor(city.aqi) }}>
                                        {city.aqi}
                                    </span>
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getAQIColor(city.aqi) }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default AQIHeatmap;

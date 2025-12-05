import React, { useRef, useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { CITIES } from '../utils/constants';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Popup, GeoJSON, useMap, Marker, LayersControl } from 'react-leaflet';
import { fetchCurrentAQI } from '../services/weatherApi';
import L from 'leaflet';

const INDIA_BOUNDS_LATLON = [[6.0, 68.0], [36.0, 98.0]];

function GeoBoundsSetter({ geojson }) {
  const map = useMap();
  React.useEffect(() => {
    if (!geojson) return;
    try {
      const layer = L.geoJSON(geojson);
      const b = layer.getBounds();
      map.fitBounds(b.pad(0.05));
      map.setMaxBounds(b.pad(0.2));
    } catch (err) {

    }
  }, [geojson, map]);
  return null;
}

const haversineKm = (aLat, aLon, bLat, bLon) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const aa = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
};

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function MapUpdater() {
  const map = useMap();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const IndiaMapSelector = ({ selectedCityId, onCitySelect, onLocationSelect }) => {
  const [marker, setMarker] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [confirmation, setConfirmation] = React.useState(null);
  const confirmTimerRef = React.useRef(null);
  const [clickedAQI, setClickedAQI] = useState(null);

  React.useEffect(() => {

    fetch('/india.geojson')
      .then(r => r.json())
      .then(j => setGeoJsonData(j))
      .catch(() => setGeoJsonData(null));
  }, []);


  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem('indiaMap.lastPin');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          setMarker({ lat: parsed.lat, lon: parsed.lon });
          if (parsed.nearestId) {
            try { onCitySelect(parsed.nearestId); } catch (e) { }
            if (onLocationSelect) onLocationSelect(parsed.lat, parsed.lon, parsed.nearestId);
          } else {
            if (onLocationSelect) onLocationSelect(parsed.lat, parsed.lon, undefined);
          }
        }
      }
    } catch (e) {

    }

  }, []);


  React.useEffect(() => {
    try {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
    } catch (e) {

    }
  }, []);

  const handleMapClick = async (lat, lon) => {
    setMarker({ lat, lon });


    try {
      const aqiResult = await fetchCurrentAQI(lat, lon);
      setClickedAQI(aqiResult?.aqi || null);
    } catch (error) {
      console.error('Error fetching AQI for clicked location:', error);
      setClickedAQI(null);
    }


    let nearestId;
    let nearestD = Infinity;
    for (const c of CITIES) {
      if (typeof c.lat !== 'number' || typeof c.lon !== 'number') continue;
      const d = haversineKm(lat, lon, c.lat, c.lon);
      if (d < nearestD) {
        nearestD = d;
        nearestId = c.id;
      }
    }

    if (nearestId) onCitySelect(nearestId);
    if (onLocationSelect) onLocationSelect(lat, lon, nearestId);


    try {
      window.localStorage.setItem('indiaMap.lastPin', JSON.stringify({ lat, lon, nearestId }));
    } catch (e) {

    }


    const cityName = nearestId ? (CITIES.find(c => c.id === nearestId)?.name ?? nearestId) : 'Unknown';
    const msg = `Pin placed: ${cityName} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    setConfirmation(msg);
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current);

    confirmTimerRef.current = window.setTimeout(() => setConfirmation(null), 3000);
  };


  React.useEffect(() => {
    return () => {
      if (confirmTimerRef.current) {
        window.clearTimeout(confirmTimerRef.current);
        confirmTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Select Location</h3>

      <div className="w-full max-w-lg mx-auto h-64 md:h-[28rem] relative">
        { }
        {confirmation && (
          <div className="absolute z-40 right-4 top-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded shadow-md text-sm font-medium border border-slate-200">
            {confirmation}
          </div>
        )}

        <MapContainer center={[22.0, 80.0]} zoom={5} minZoom={4} maxZoom={8} style={{ height: '100%', width: '100%' }}>
          <MapUpdater />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Clean (Positron)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Minimal (Positron No Labels)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Standard (OSM)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <ClickHandler onMapClick={handleMapClick} />

          { }
          {geoJsonData && (
            <>
              <GeoJSON data={geoJsonData} style={{ opacity: 0, fillOpacity: 0 }} />
              <GeoBoundsSetter geojson={geoJsonData} />
            </>
          )}

          { }
          {CITIES.filter(c => typeof c.lat === 'number' && typeof c.lon === 'number').map(c => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lon]}
              radius={6}
              pathOptions={{ color: selectedCityId === c.id ? '#1e40af' : '#3b82f6', fillColor: selectedCityId === c.id ? '#1e40af' : '#fff', weight: 2 }}
            />
          ))}

          { }
          {marker && (
            <Marker position={[marker.lat, marker.lon]}>
              <Popup>
                <div className="text-sm">
                  <div><strong>Clicked Location</strong></div>
                  <div className="mt-2">Lat: {marker.lat.toFixed(5)}</div>
                  <div>Lon: {marker.lon.toFixed(5)}</div>
                  <div className="mt-2 text-xs text-slate-600">
                    Nearest city: {CITIES.find(c => c.id === selectedCityId)?.name || '—'}
                  </div>
                  {clickedAQI !== null && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <div className="font-semibold text-slate-700">AQI: <span className="text-lg">{clickedAQI}</span></div>
                      <div className="text-xs text-slate-500">Air Quality Index</div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default IndiaMapSelector;

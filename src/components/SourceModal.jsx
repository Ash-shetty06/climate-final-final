import React, { useEffect, useRef } from 'react';
import TempSourceTable from './TempSourceTable';
import HumiditySourceTable from './HumiditySourceTable';
import WindSourceTable from './WindSourceTable';
import RainSourceTable from './RainSourceTable';
import AQISourceTable from './AQISourceTable';

const SourceModal = ({ isOpen, metric, city, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    
    
    const t = setTimeout(() => {
      if (containerRef.current) {
        try {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (e) {
          
        }
        containerRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !metric) return null;

  const renderBody = () => {
    switch (metric) {
      case 'temp':
        return <TempSourceTable city={city} />;
      case 'humidity':
        return <HumiditySourceTable city={city} />;
      case 'wind':
        return <WindSourceTable city={city} />;
      case 'rain':
        return <RainSourceTable city={city} />;
      case 'aqi':
        return <AQISourceTable city={city} />;
      
      case 'uv':
      case 'pressure':
      case 'sunrise':
      case 'sunset':
      case 'visibility':
      case 'cloud':
        return <TempSourceTable city={city} />;
      default:
        return null;
    }
  };

  const titleMap = {
    temp: 'Temperature — Sources',
    humidity: 'Humidity — Sources',
    wind: 'Wind — Sources',
    rain: 'Rain Probability — Sources',
    aqi: 'AQI — Sources',
    uv: 'UV Index — Sources',
    pressure: 'Pressure — Sources',
    sunrise: 'Sunrise — Sources',
    sunset: 'Sunset — Sources',
    visibility: 'Visibility — Sources',
    cloud: 'Cloud Cover — Sources',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-3xl w-full mx-4">
        <div
          ref={containerRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className="bg-white rounded-lg shadow-lg ring-1 ring-slate-200 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-800">{titleMap[metric]}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
          </div>
          <div className="p-4 max-h-[70vh] overflow-auto">
            {renderBody()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceModal;

import React, { useState, useEffect } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import AuthModal from './AuthModal';

const DownloadDataButtons = ({ city, historicalData }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [deferredAction, setDeferredAction] = useState(null); // 'csv' | 'json' | null
  const [currentUser, setCurrentUser] = useState(null);

  const API_BASE = 'http://10.13.130.39:4000';

  const isAuthenticated = () => Boolean(currentUser);

  useEffect(() => {
    // on mount, check if server session cookie is valid
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, { credentials: 'include' });
        if (!res.ok) return setCurrentUser(null);
        const data = await res.json();
        setCurrentUser({ email: data.email, role: data.role });
      } catch (err) {
        setCurrentUser(null);
      }
    };
    check();
  }, []);

  const doDownloadJSON = () => {
    const data = {
      city: city.name,
      generatedAt: new Date().toISOString(),
      weather: city.weather,
      aqi: city.aqi,
      historical: historicalData || []
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atmosview_${city.id}_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const doDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Source,Value1,Value2,Value3,LastUpdated\n";

    (city.weather || []).forEach(w => {
      csvContent += `Weather,${w.source},Temp:${w.temp},Humidity:${w.humidity},Wind:${w.windSpeed},${w.lastUpdated}\n`;
    });

    (city.aqi || []).forEach(a => {
      csvContent += `AQI,${a.source},Index:${a.aqi},PM2.5:${a.pm25},PM10:${a.pm10},${a.lastUpdated}\n`;
    });

    if (historicalData) {
      csvContent += "\nHistorical Data\nDate,Temp,AQI,Rainfall\n";
      historicalData.forEach(h => {
        csvContent += `${h.date},${h.temp},${h.aqi},${h.rainfall}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `atmosview_${city.id}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const requireAuthThen = (action) => {
    if (isAuthenticated()) {
      if (action === 'csv') doDownloadCSV();
      if (action === 'json') doDownloadJSON();
      return;
    }
    setDeferredAction(action);
    setShowAuth(true);
  };

  const onAuthenticated = () => {
    setShowAuth(false);
    if (deferredAction === 'csv') doDownloadCSV();
    if (deferredAction === 'json') doDownloadJSON();
    setDeferredAction(null);
  };

  return (
    <>
      <div className="flex gap-3 mt-4 sm:mt-0">
        <button 
          onClick={() => requireAuthThen('csv')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200 shadow-sm active:scale-95"
          title={`Download all data for ${city.name} as CSV`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          CSV
        </button>
        <button 
          onClick={() => requireAuthThen('json')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200 shadow-sm active:scale-95"
          title={`Download all data for ${city.name} as JSON`}
        >
          <FileJson className="w-4 h-4" />
          JSON
        </button>
      </div>

      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setDeferredAction(null); }}
          onAuthenticated={(user) => {
            // Server set httpOnly cookie; record user and resume deferred action
            setCurrentUser(user);
            setShowAuth(false);
            if (deferredAction === 'csv') doDownloadCSV();
            if (deferredAction === 'json') doDownloadJSON();
            setDeferredAction(null);
          }}
        />
      )}
    </>
  );
};

export default DownloadDataButtons;
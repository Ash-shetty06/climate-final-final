import React from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

const DownloadDataButtons = ({ city, historicalData }) => {

  const handleDownloadJSON = () => {
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

  const handleDownloadCSV = () => {

    let csvContent = "data:text/csv;charset=utf-8,";

    csvContent += "Type,Source,Value1,Value2,Value3,LastUpdated\n";

    if (city.weather && Array.isArray(city.weather)) {
      city.weather.forEach(w => {
        csvContent += `Weather,${w.source},Temp:${w.temp},Humidity:${w.humidity},Wind:${w.windSpeed},${w.lastUpdated}\n`;
      });
    }

    if (city.aqi && Array.isArray(city.aqi)) {
      city.aqi.forEach(a => {
        csvContent += `AQI,${a.source},Index:${a.aqi},PM2.5:${a.pm25},PM10:${a.pm10},${a.lastUpdated}\n`;
      });
    }

    if (historicalData && Array.isArray(historicalData)) {
      csvContent += "\nHistorical Data\nDate,Temp,AQI,Rainfall\n";
      historicalData.forEach(h => {
        csvContent += `${h.date},${h.temp_om || h.temp_vc || '-'},${h.aqi_om || h.aqi_vc || '-'},${h.rain_om || h.rain_vc || '-'}\n`;
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

  return (
    <div className="flex gap-3 mt-4 sm:mt-0">
      <button
        onClick={handleDownloadCSV}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200 shadow-sm active:scale-95"
        title={`Download all data for ${city.name} as CSV`}
      >
        <FileSpreadsheet className="w-4 h-4" />
        CSV
      </button>
      <button
        onClick={handleDownloadJSON}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200 shadow-sm active:scale-95"
        title={`Download all data for ${city.name} as JSON`}
      >
        <FileJson className="w-4 h-4" />
        JSON
      </button>
    </div>
  );
};

export default DownloadDataButtons;

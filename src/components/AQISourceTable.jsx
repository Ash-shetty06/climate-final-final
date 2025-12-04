import React from 'react';

const AQISourceTable = ({ city }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-sm">
      <h3 className="font-semibold mb-3">AQI — Sources</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">AQI</th>
              <th className="px-4 py-2">PM2.5</th>
              <th className="px-4 py-2">PM10</th>
              <th className="px-4 py-2">O3</th>
              <th className="px-4 py-2">NO2</th>
              <th className="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {city.aqi.map((a, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-slate-900">{a.source}</td>
                <td className="px-4 py-3">{a.aqi}</td>
                <td className="px-4 py-3">{a.pm25}</td>
                <td className="px-4 py-3">{a.pm10}</td>
                <td className="px-4 py-3">{a.o3}</td>
                <td className="px-4 py-3">{a.no2}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{a.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AQISourceTable;

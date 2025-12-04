import React from 'react';

const WindSourceTable = ({ city }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-sm">
      <h3 className="font-semibold mb-3">Wind — Sources</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Wind (km/h)</th>
              <th className="px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {city.weather.map((w, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors duration-150">
                <td className="px-4 py-3 font-medium text-slate-900">{w.source}</td>
                <td className="px-4 py-3">{w.windSpeed} km/h</td>
                <td className="px-4 py-3 text-xs text-slate-400">{w.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WindSourceTable;

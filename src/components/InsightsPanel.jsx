import React from 'react';
import { TrendingUp, TrendingDown, Sun, AlertCircle } from 'lucide-react';

const InsightsPanel = ({ todayTemp, todayAQI, history }) => {
  
  
  const temps = history.map(h => h.temp_om).filter(t => t !== null && t !== undefined);
  const aqis = history.map(h => h.aqi_om || h.aqi).filter(a => a !== null && a !== undefined);

  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  const betterAqiCount = aqis.filter(val => todayAQI < val).length;
  const betterAqiPercent = Math.round((betterAqiCount / aqis.length) * 100);

  const insights = [];

  
  const tempDiff = todayTemp - avgTemp;
  if (todayTemp >= maxTemp) {
    insights.push({
      icon: <TrendingUp className="w-5 h-5 text-red-500" />,
      text: `Heatwave alert! Today is the hottest day in the last 30 days (${todayTemp.toFixed(1)}°C).`,
      bg: "bg-red-50"
    });
  } else if (todayTemp <= minTemp) {
    insights.push({
      icon: <TrendingDown className="w-5 h-5 text-blue-500" />,
      text: `It's freezing! Today is the coldest day in the last 30 days (${todayTemp.toFixed(1)}°C).`,
      bg: "bg-blue-50"
    });
  } else if (tempDiff > 2) {
    insights.push({
      icon: <Sun className="w-5 h-5 text-orange-500" />,
      text: `It's warmer than usual. ${tempDiff.toFixed(1)}°C above the 30-day average.`,
      bg: "bg-orange-50"
    });
  } else if (tempDiff < -2) {
    insights.push({
      icon: <TrendingDown className="w-5 h-5 text-blue-400" />,
      text: `It's cooler than usual. ${Math.abs(tempDiff).toFixed(1)}°C below the 30-day average.`,
      bg: "bg-blue-50"
    });
  } else {
    insights.push({
      icon: <Sun className="w-5 h-5 text-green-500" />,
      text: "Temperature is typical for this time of year (within seasonal average).",
      bg: "bg-green-50"
    });
  }

  
  if (betterAqiPercent > 70) {
    insights.push({
      icon: <TrendingDown className="w-5 h-5 text-green-600" />,
      text: `Great air today! Better than ${betterAqiPercent}% of the last 30 days.`,
      bg: "bg-green-50"
    });
  } else if (betterAqiPercent < 30) {
    insights.push({
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
      text: `Air quality is poor today. Worse than ${100 - betterAqiPercent}% of recent days.`,
      bg: "bg-orange-50"
    });
  } else {
    insights.push({
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
      text: `Air quality is average compared to the last month.`,
      bg: "bg-blue-50"
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {insights.map((insight, idx) => (
        <div key={idx} className={`${insight.bg} p-4 rounded-xl border border-transparent hover:border-slate-200 transition-all flex items-start gap-4 shadow-sm`}>
          <div className="mt-1 bg-white p-2 rounded-full shadow-sm">
            {insight.icon}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">Daily Insight</h4>
            <p className="text-slate-700 font-medium">{insight.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightsPanel;

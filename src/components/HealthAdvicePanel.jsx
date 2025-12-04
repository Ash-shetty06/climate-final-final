import React from 'react';
import { HeartPulse, Droplets, ThermometerSun } from 'lucide-react';

const HealthAdvicePanel = ({ aqi, temp, humidity }) => {
  let aqiAdvice = "";
  let aqiColor = "";

  if (aqi <= 50) {
    aqiAdvice = "Air quality is excellent! Perfect for outdoor activities like running or cycling.";
    aqiColor = "border-green-200 bg-green-50 text-green-800";
  } else if (aqi <= 100) {
    aqiAdvice = "Air quality is acceptable. However, unusually sensitive people should consider reducing prolonged outdoor exertion.";
    aqiColor = "border-yellow-200 bg-yellow-50 text-yellow-800";
  } else if (aqi <= 150) {
    aqiAdvice = "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
    aqiColor = "border-orange-200 bg-orange-50 text-orange-800";
  } else if (aqi <= 200) {
    aqiAdvice = "Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.";
    aqiColor = "border-red-200 bg-red-50 text-red-800";
  } else if (aqi <= 300) {
    aqiAdvice = "Health warnings of emergency conditions. The entire population is more likely to be affected.";
    aqiColor = "border-purple-200 bg-purple-50 text-purple-800";
  } else {
    aqiAdvice = "Hazardous! Everyone should avoid all outdoor exertion.";
    aqiColor = "border-rose-950 bg-rose-100 text-rose-900";
  }

  let weatherAdvice = [];
  if (temp > 35) weatherAdvice.push("Extreme heat! Stay hydrated and avoid direct sun during peak hours (12 PM - 4 PM).");
  else if (temp > 30) weatherAdvice.push("It's a hot day. Drink plenty of water if you're outside.");

  if (temp < 5) weatherAdvice.push("Freezing conditions. Wear heavy winter clothing and limit exposure.");
  else if (temp < 15) weatherAdvice.push("It's chilly. A jacket or sweater is recommended.");

  if (humidity > 80) weatherAdvice.push("Very high humidity. It might feel hotter than it actually is.");
  else if (humidity < 20) weatherAdvice.push("Air is very dry. Use moisturizer and stay hydrated.");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <HeartPulse className="w-5 h-5 text-rose-500" />
        <h3 className="font-semibold text-slate-800">Health & Activity Advice</h3>
      </div>

      <div className="p-6 flex flex-col gap-4 flex-grow">
        <div className={`p-4 rounded-lg border ${aqiColor}`}>
          <span className="block text-xs font-bold uppercase mb-1 opacity-80">Based on Air Quality</span>
          <p className="font-medium">{aqiAdvice}</p>
        </div>

        {weatherAdvice.length > 0 && (
          <div className="space-y-3">
            {weatherAdvice.map((advice, idx) => (
              <div key={idx} className="flex items-start gap-3 text-slate-600">
                {advice.includes('humidity') || advice.includes('dry') ? <Droplets className="w-5 h-5 text-blue-400 mt-0.5" /> : <ThermometerSun className="w-5 h-5 text-orange-400 mt-0.5" />}
                <p className="text-sm">{advice}</p>
              </div>
            ))}
          </div>
        )}

        {weatherAdvice.length === 0 && (
          <div className="flex items-start gap-3 text-slate-600">
            <ThermometerSun className="w-5 h-5 text-green-500 mt-0.5" />
            <p className="text-sm">Weather conditions are mild. No specific precautions needed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthAdvicePanel;

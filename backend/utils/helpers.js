export const calculateAQI = (pollutants) => {
  const { pm25, pm10, o3, no2, so2, co } = pollutants;
  
  const aqiValues = [];
  
  if (pm25 !== undefined) {
    aqiValues.push(calculateSubIndex(pm25, 'PM25'));
  }
  if (pm10 !== undefined) {
    aqiValues.push(calculateSubIndex(pm10, 'PM10'));
  }
  if (o3 !== undefined) {
    aqiValues.push(calculateSubIndex(o3, 'O3'));
  }
  if (no2 !== undefined) {
    aqiValues.push(calculateSubIndex(no2, 'NO2'));
  }
  if (so2 !== undefined) {
    aqiValues.push(calculateSubIndex(so2, 'SO2'));
  }
  if (co !== undefined) {
    aqiValues.push(calculateSubIndex(co, 'CO'));
  }
  
  return Math.max(...aqiValues);
};

const calculateSubIndex = (value, pollutant) => {
  const breakpoints = {
    PM25: [
      { Bp_lo: 0, Bp_hi: 12, I_lo: 0, I_hi: 50 },
      { Bp_lo: 12.1, Bp_hi: 35.4, I_lo: 51, I_hi: 100 },
      { Bp_lo: 35.5, Bp_hi: 55.4, I_lo: 101, I_hi: 150 },
      { Bp_lo: 55.5, Bp_hi: 150.4, I_lo: 151, I_hi: 200 },
      { Bp_lo: 150.5, Bp_hi: 250.4, I_lo: 201, I_hi: 300 },
      { Bp_lo: 250.5, Bp_hi: 500, I_lo: 301, I_hi: 500 }
    ],
    PM10: [
      { Bp_lo: 0, Bp_hi: 54, I_lo: 0, I_hi: 50 },
      { Bp_lo: 55, Bp_hi: 154, I_lo: 51, I_hi: 100 },
      { Bp_lo: 155, Bp_hi: 254, I_lo: 101, I_hi: 150 },
      { Bp_lo: 255, Bp_hi: 354, I_lo: 151, I_hi: 200 },
      { Bp_lo: 355, Bp_hi: 424, I_lo: 201, I_hi: 300 },
      { Bp_lo: 425, Bp_hi: 604, I_lo: 301, I_hi: 500 }
    ]
  };

  const bp = breakpoints[pollutant];
  if (!bp) return 0;

  for (let i = 0; i < bp.length; i++) {
    if (value >= bp[i].Bp_lo && value <= bp[i].Bp_hi) {
      const aqi = ((bp[i].I_hi - bp[i].I_lo) / (bp[i].Bp_hi - bp[i].Bp_lo)) * (value - bp[i].Bp_lo) + bp[i].I_lo;
      return Math.round(aqi);
    }
  }
  
  return 500;
};

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { label: 'Good', color: 'green', advice: 'Air quality is satisfactory' };
  if (aqi <= 100) return { label: 'Moderate', color: 'yellow', advice: 'Members of sensitive groups may be affected' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'orange', advice: 'Sensitive groups should take precautions' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'red', advice: 'Everyone may begin to experience health effects' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'purple', advice: 'Health alert: The entire population is more likely to be affected' };
  return { label: 'Hazardous', color: 'maroon', advice: 'Health warning of emergency conditions: everyone is more likely to be affected' };
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatTimestamp = (date) => {
  return new Date(date).toLocaleString();
};

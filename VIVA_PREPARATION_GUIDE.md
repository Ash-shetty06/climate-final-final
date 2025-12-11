# VIVA PREPARATION GUIDE - AtmosView Climate Application

## Table of Contents
1. [Landing Page Cards](#1-landing-page-cards)
2. [Navigation Bar (Home, Dashboard, Historical, Compare)](#2-navigation-bar)
3. [User Authentication (manoj420, Researcher, Logout)](#3-user-authentication)
4. [Dashboard Features](#4-dashboard-features)
5. [Historical Page Features](#5-historical-page-features)
6. [Compare Page Features](#6-compare-page-features)

---

## 1. Landing Page Cards

### Q: When I click on the first card "Multi Source Weather," where is the navigation code?

**File:** `src/pages/LandingPage.jsx`  
**Lines:** 42-47

```javascript
<FeatureCard
  icon={<CloudRain className="w-8 h-8 text-blue-500" />}
  title="Multi-Source Weather"
  description="Aggregated data from IMD, OpenWeather, and more."
  onClick={() => navigate('/dashboard')}
/>
```

**Explanation:**
- The `FeatureCard` component receives an `onClick` prop
- `onClick={() => navigate('/dashboard')}` uses React Router's `navigate` function
- When clicked, it navigates to `/dashboard` route

**Where FeatureCard handles the click (Lines 74-85):**
```javascript
const FeatureCard = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}  // The onClick handler is attached here
    className="bg-white p-6 rounded-xl border border-slate-200... cursor-pointer"
  >
    <div className="mb-4...">
      {icon}
    </ div>
    <h3 className="text-xl font-bold...">{title}</h3>
    <p className="text-slate-600...">{description}</p>
  </div>
);
```

**Explanation:** The `div` has `onClick={onClick}` which triggers the navigation when any part of the card is clicked.

### Q: Same for all 4 cards?

**Yes! All 4 cards work the same way:**

**Card 2 - Multi-Source AQI (Lines 48-53):**
```javascript
<FeatureCard
  icon={<Wind className="w-8 h-8 text-green-500" />}
  title="Multi-Source AQI"
  description="Real-time pollution tracking from verified sensors."
  onClick={() => navigate('/dashboard')}
/>
```

**Card 3 - Historical Explorer (Lines 54-59):**
```javascript
<FeatureCard
  icon={<BarChart3 className="w-8 h-8 text-purple-500" />}
  title="Historical Explorer"
  description="Analyze climate trends over the last decade."
  onClick={() => navigate('/historical')}  // Goes to historical page
/>
```

**Card 4 - City Comparison (Lines 60-65):**
```javascript
<FeatureCard
  icon={<Map className="w-8 h-8 text-orange-500" />}
  title="City Comparison"
  description="Side-by-side environmental analytics."
  onClick={() => navigate('/compare')}  // Goes to compare page
/>
```

---

## 2. Navigation Bar

### Q: Where is the code for Home, Dashboard, Historical, Compare links?

**File:** `src/components/Navbar.jsx`  
**Lines:** 41-46

```javascript
<div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
  <Link to="/" className={getLinkClass('/')}>Home</Link>
  <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
  <Link to="/historical" className={getLinkClass('/historical')}>Historical</Link>
  <Link to="/compare" className={getLinkClass('/compare')}>Compare</Link>
</div>
```

**Explanation:**
- Uses React Router's `Link` component
- `to` prop specifies the destination route
- `getLinkClass` function (lines 23-29) applies active styling

**getLinkClass function (Lines 23-29):**
```javascript
const getLinkClass = (path) => {
  const isActive = location.pathname === path;
  return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
    ? 'bg-blue-100 text-blue-700'  // Active link style
    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'  // Inactive style
    }`;
};
```

**Explanation:** Checks if current path matches the link's path and applies blue background if active.

---

## 3. User Authentication

### Q: Where is "manoj420 Researcher" code?

**File:** `src/components/Navbar.jsx`  
**Lines:** 48-58

```javascript
{user ? (
  <>
    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg">
      <User className="w-4 h-4 text-slate-600" />
      <span className="text-sm font-medium text-slate-700">{user.username}</span>
      {user.role === 'researcher' && (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
          Researcher
        </span>
      )}
    </div>
```

**Explanation:**
- `{user.username}` displays the username (e.g., "manoj420")
- Checks if `user.role === 'researcher'` 
- If true, shows purple "Researcher" badge

**Where user state is set (Lines 9-15):**
```javascript
const [user, setUser] = useState(null);

useEffect(() => {
  if (isAuthenticated()) {
    setUser(getCurrentUser());  // Gets user from localStorage
  }
}, [location]);
```

### Q: Where is Logout code?

**File:** `src/components/Navbar.jsx`  
**Lines:** 59-65

```javascript
<button
  onClick={handleLogout}
  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600..."
>
  <LogOut className="w-4 h-4" />
  <span className="hidden sm:inline">Logout</span>
</button>
```

**handleLogout function (Lines 17-21):**
```javascript
const handleLogout = () => {
  logout();  // Clears user from localStorage
  setUser(null);  // Clears user state
  navigate('/');  // Navigates to home page
};
```

**Explanation:** Calls `logout()` service function, clears state, and redirects to home.

---

## 4. Dashboard Features

### Q: Where is the heart icon to add favorite cities?

**File:** `src/pages/DashboardPage.jsx`  
**Lines:** 234-236

```javascript
<button onClick={toggleFavorite} className="focus:outline-none transition-transform hover:scale-110">
  <Heart className={`w-6 h-6 ${isCurrentFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
</button>
```

**toggleFavorite function (Lines 83-115):**
```javascript
const toggleFavorite = async () => {
  if (!isAuthenticated()) {
    alert('Please login to save favorites!');
    return;
  }

  const isFav = favorites.some(fav => fav.name === currentLocation.name);

  try {
    if (isFav) {
      // Remove from favorites
      const fav = favorites.find(f => f.name === currentLocation.name);
      if (fav) {
        await removeFavorite(fav.cityId || 'custom');
        const updatedUser = getCurrentUser();
        setFavorites(updatedUser.favoriteCities);
        setUser(updatedUser);
      }
    } else {
      // Add to favorites
      const cityData = {
        cityId: selectedCityId || `custom-${Date.now()}`,
        name: currentLocation.name,
        lat: currentLocation.lat,
        lon: currentLocation.lon
      };
      await addFavorite(cityData);
      const updatedUser = getCurrentUser();
      setFavorites(updatedUser.favoriteCities);
      setUser(updatedUser);
    }
  } catch (err) {
    console.error('Fav error', err);
  }
};
```

**Explanation:** Checks authentication, then either adds or removes city from favorites using service functions.

### Q: Where is the search bar code?

**File:** `src/pages/DashboardPage.jsx`  
**Lines:** 242-253

```javascript
<div className="relative w-full sm:w-80" ref={searchRef}>
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <Search className="h-5 w-5 text-gray-400" />
  </div>
  <input
    type="text"
    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg..."
    placeholder="Search city (e.g. Mumbai, Tokyo)..."
    value={searchQuery}
    onChange={handleSearch}
    onFocus={() => { if (searchQuery.length >= 2) setShowDropdown(true); }}
  />
```

**handleSearch function (Lines 45-62):**
```javascript
const handleSearch = async (e) => {
  const query = e.target.value;
  setSearchQuery(query);

  if (query.length < 2) {
    setSearchResults([]);
    setShowDropdown(false);
    return;
  }

  setIsSearching(true);
  setShowDropdown(true);

  const results = await searchCities(query);  // API call
  setSearchResults(results);
  setIsSearching(false);
};
```

**Explanation:** When user types, if query is 2+ characters, it calls `searchCities` API and shows dropdown results.

**Search Results Dropdown (Lines 256-275):**
```javascript
{showDropdown && (
  <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md...">
    {isSearching ? (
      <div className="px-4 py-2 text-slate-500">Searching...</div>
    ) : searchResults.length > 0 ? (
      searchResults.map((city) => (
        <div
          key={city.id}
          className="cursor-pointer... hover:bg-blue-50..."
          onClick={() => handleSelectCity(city)}
        >
          <span className="block truncate font-medium">{city.name}</span>
          <span className="block truncate text-xs text-slate-500">{city.state}, {city.country}</span>
        </div>
      ))
    ) : (
      <div className="px-4 py-2 text-slate-500">No cities found</div>
    )}
  </div>
)}
```

### Q: Where is 24 hours weather code?

**File:** `src/components/HourlyForecast.jsx`  
**Lines:** 1-51 (Entire component)

**Key parts:**

```javascript
const HourlyForecast = ({ data }) => {
  // Process hourly data (Lines 16-21)
  const hours = data.time.slice(0, 24).map((time, index) => ({
    time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
    temp: data.temperature_2m[index],
    precipitation: data.precipitation_probability?.[index] || 0,
    weatherCode: data.weather_code?.[index] || 0
  }));

  // Display each hour (Lines 28-43)
  return (
    <div className="flex gap-4 min-w-max pb-2">
      {hours.map((hour, index) => (
        <div className="flex flex-col items-center bg-slate-50 rounded-lg p-3...">
          <span className="text-xs font-medium...">{hour.time}</span>
          <WeatherIcon code={hour.weatherCode} size={32} />
          <span className="text-lg font-bold...">{hour.temp.toFixed(0)}°</span>
          {hour.precipitation > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <Droplets className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-blue-600">{hour.precipitation}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

**Explanation:** Receives forecast data as prop, slices first 24 hours, maps each to display time, temperature, weather icon, and precipitation.

**Where it's called in Dashboard (DashboardPage.jsx Line 300):**
```javascript
<HourlyForecast data={hourlyForecast} />
```

### Q: Where is 7 days forecast code?

**File:** `src/components/DailyForecast.jsx`  
**Lines:** 1-85 (Entire component)

**Key parts:**

```javascript
const DailyForecast = ({ data }) => {
  // Process daily data (Lines 16-26)
  const days = data.time.map((time, index) => ({
    day: formatDay(time),
    date: new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tempMax: data.temperature_2m_max[index],
    tempMin: data.temperature_2m_min[index],
    precipitation: data.precipitation_sum?.[index] || 0,
    weatherCode: data.weather_code?.[index] || 0,
    uvIndex: data.uv_index_max?.[index],
  }));

  // Display each day (Lines 32-77)
  return days.map((day, index) => (
    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4...">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-20">
          <div className="font-bold...">{day.day}</div>
          <div className="text-xs...">{day.date}</div>
        </div>
        <WeatherIcon code={day.weatherCode} size={36} />
      </div>
      
      {/* Temperature high/low */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-red-500" />
        <span className="font-bold">{day.tempMax.toFixed(0)}°</span>
        <span className="text-slate-400">/</span>
        <TrendingDown className="w-4 h-4 text-blue-500" />
        <span className="font-medium">{day.tempMin.toFixed(0)}°</span>
      </div>
    </div>
  ));
};
```

**Explanation:** Maps each day to show day name, date, weather icon, max/min temps, and precipitation if >0.

### Q: Where is code for Current Weather & Metrics cards that show source when clicked?

**File:** `src/pages/DashboardPage.jsx`  
**Lines:** 313-353 (First row of cards)

**Example - Temperature Card (Lines 314-321):**
```javascript
<SummaryCard
  title="Temperature"
  value={weatherData?.temp?.toFixed(1) || '--'}
  unit="°C"
  subtitle="Current Temp"
  onClick={() => openModal('temp')}  // Opens modal when clicked
  icon={<Thermometer className="text-orange-500" />}
/>
```

**openModal function (Lines 180-183):**
```javascript
const openModal = (metric) => {
  setModalMetric(metric);  // Sets which metric to show
  setIsModalOpen(true);    // Opens the modal
};
```

**SourceModal component call (Line 484):**
```javascript
<SourceModal isOpen={isModalOpen} metric={modalMetric} city={enrichedCityData} onClose={closeModal} />
```

**File:** `src/components/SourceModal.jsx`  
**Lines:** 39-62 (Modal body rendering)

```javascript
const renderBody = () => {
  switch (metric) {
    case 'temp':
      return <TempSourceTable city={city} />;
    case 'humidity':
      return <HumiditySourceTable city={city} />;
    case 'wind':
      return <WindSourceTable city={city} />;
    case 'aqi':
      return <AQISourceTable city={city} />;
    // ... more cases
  }
};
```

**Explanation:** Each card has `onClick={() => openModal('metricName')}` which opens SourceModal showing different data sources for that metric.

### Q: Where is Select Location code?

**File:** `src/pages/DashboardPage.jsx`  
**Lines:** 428-452

```javascript
<div>
  <h3 className="text-lg font-semibold text-slate-800 mb-3">Select Location</h3>
  <IndiaMapSelector
    selectedCityId={selectedCityId}
    onCitySelect={(id) => {
      setSelectedCityId(id);
      const city = CITIES.find(c => c.id === id);
      if (city) {
        setCurrentLocation({ name: city.name, lat: city.lat, lon: city.lon });
      }
    }}
    onLocationSelect={(lat, lon, nearestId) => {
      setClickedCoord({ lat, lon });
      if (nearestId) {
        setSelectedCityId(nearestId);
        const city = CITIES.find(c => c.id === nearestId);
        if (city) {
          setCurrentLocation({ name: city.name, lat: city.lat, lon: city.lon });
        }
      } else {
        setSelectedCityId(null);
        setCurrentLocation({ name: 'Custom Location', lat, lon });
      }
    }}
  />
</div>
```

**Explanation:** `IndiaMapSelector` component handles location selection, calls `onCitySelect` or `onLocationSelect` callbacks to update dashboard state.

### Q: Where is map types code?

**File:** `src/components/IndiaMapSelector.jsx`  
**Lines:** 175-203

```javascript
<LayersControl position="topright">
  <LayersControl.BaseLayer checked name="Clean (Positron)">
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>...'
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Minimal (Positron No Labels)">
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Satellite (Esri)">
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />
  </LayersControl.BaseLayer>

  <LayersControl.BaseLayer name="Standard (OSM)">
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
  </LayersControl.BaseLayer>
</LayersControl>
```

**Explanation:** Leaflet's `LayersControl` component provides layer switcher in top-right corner. Each `BaseLayer` is a different map style (Clean, Minimal, Satellite, Standard).

### Q: Where are the 6 blue circles on the map?

**File:** `src/components/IndiaMapSelector.jsx`  
**Lines:** 216-223

```javascript
{CITIES.filter(c => typeof c.lat === 'number' && typeof c.lon === 'number').map(c => (
  <CircleMarker
    key={c.id}
    center={[c.lat, c.lon]}
    radius={6}
    pathOptions={{ 
      color: selectedCityId === c.id ? '#1e40af' : '#3b82f6',  // Dark blue if selected
      fillColor: selectedCityId === c.id ? '#1e40af' : '#fff',  // White fill if not selected
      weight: 2 
    }}
  />
))}
```

**Explanation:** Maps over `CITIES` array (from constants), creates `CircleMarker` at each city's lat/lon. Changes color to dark blue if city is selected.

### Q: Where is code to select any city with cursor on map?

**File:** `src/components/IndiaMapSelector.jsx`  
**Lines:** 38-45 (ClickHandler component)

```javascript
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);  // Calls handler with clicked coordinates
    }
  });
  return null;
}
```

**Lines:** 205 (Using ClickHandler)
```javascript
<ClickHandler onMapClick={handleMapClick} />
```

**handleMapClick function (Lines 108-149):**
```javascript
const handleMapClick = async (lat, lon) => {
  setMarker({ lat, lon });  // Places marker at clicked location

  // Fetch AQI for clicked location
  try {
    const aqiResult = await fetchCurrentAQI(lat, lon);
    setClickedAQI(aqiResult?.aqi || null);
  } catch (error) {
    setClickedAQI(null);
  }

  // Find nearest city
  let nearestId;
  let nearestD = Infinity;
  for (const c of CITIES) {
    const d = haversineKm(lat, lon, c.lat, c.lon);  // Calculate distance
    if (d < nearestD) {
      nearestD = d;
      nearestId = c.id;
    }
  }

  if (nearestId) onCitySelect(nearestId);  // Select nearest city
  if (onLocationSelect) onLocationSelect(lat, lon, nearestId);

  // Save to localStorage
  localStorage.setItem('indiaMap.lastPin', JSON.stringify({ lat, lon, nearestId }));
};
```

**Explanation:** When map is clicked, finds nearest predefined city using haversine distance formula, places marker, fetches AQI, and notifies parent component.

---

## 5. Historical Page Features

### Q: Where is code for selecting time range?

**File:** `src/pages/HistoricalPage.jsx`  
**Lines:** 460-475

```javascript
<div className="flex flex-col gap-2 w-full sm:w-1/3">
  <label className="text-sm font-semibold text-slate-600">Time Range</label>
  <select
    className="p-3 border border-slate-300 rounded-lg..."
    value={timeRange}
    onChange={(e) => setTimeRange(e.target.value)}
  >
    <option value="24h">Last 24 Hours</option>
    <option value="7d">Last 7 Days</option>
    <option value="30d">Last 30 Days</option>
    <option value="90d">Last 90 Days</option>
    <option value="1yr">Last 1 Year</option>
    <option value="5yr">Last 5 Years</option>
    <option value="10yr">Last 10 Years</option>
  </select>
</div>
```

**Explanation:** Dropdown select element with options for different time ranges. `onChange` updates `timeRange` state, which triggers data fetch.

**Effect that loads data when timeRange changes (Lines 33-143):**
```javascript
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    // ... calculate start and end dates based on timeRange
    if (timeRange === '30d') {
      startDate.setDate(endDate.getDate() - 30);
    } else if (timeRange === '1yr') {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }
    // ... fetch data
    const data = await fetchHistoricalData(lat, lon, startDate, endDate);
    setHistoricalData(data);
  };
  loadData();
}, [selectedCity, timeRange, dataSource]);  // Runs when timeRange changes
```

### Q: How are graphs visualized? How is data converted to graphs?

**File:** `src/pages/HistoricalPage.jsx`

**Step 1: Data Processing (Lines 234-249)**
```javascript
// Transform raw data into chart series
const dates = historicalData.map(d => d.date);

const tempSeries = [
  { 
    name: 'Temp (Open-Meteo)', 
    data: historicalData.filter(d => d.temp_om != null).map(d => ({ 
      x: new Date(d.date).getTime(),  // Convert date to timestamp for x-axis
      y: parseFloat(d.temp_om)         // Temperature value for y-axis
    }))
  },
  { 
    name: 'Temp (Visual Crossing)', 
    data: historicalData.filter(d => d.temp_vc != null).map(d => ({ 
      x: new Date(d.date).getTime(), 
      y: parseFloat(d.temp_vc) 
    }))
  }
].filter(s => s.data.length > 0);  // Remove empty series
```

**Step 2: Chart Options Configuration (Lines 280-315)**
```javascript
const commonOptions = {
  chart: {
    zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
    toolbar: {
      show: true,
      tools: {
        download: true,
        zoomin: true,
        zoomout: true,
        reset: true
      }
    }
  },
  xaxis: {
    type: 'datetime',  // X-axis is time-based
    min: dateRangeBoundaries.min,  // Set min/max based on selected range
    max: dateRangeBoundaries.max,
    labels: { format: 'dd MMM yyyy' }
  },
  tooltip: { x: { format: 'dd MMM yyyy' } },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top' }
};

const tempOptions = {
  ...commonOptions,
  chart: { ...commonOptions.chart, id: 'temp-chart', type: 'line' },
  colors: ['#f97316', '#8b5cf6'],  // Orange and purple
  yaxis: {
    title: { text: 'Temperature (°C)' },
    labels: { formatter: (val) => val ? val.toFixed(1) : val }
  }
};
```

**Step 3: Rendering Charts (Lines 592-599)**
```javascript
{tempSeries.length > 0 && (
  <div className="bg-white p-4 rounded-xl border...">
    <h3 className="font-bold text-lg...">Temperature Trend (°C)</h3>
    <div className="w-full h-[350px]">
      <Chart 
        key={`temp-${timeRange}-${historicalData.length}`}
        options={tempOptions}  // Chart configuration
        series={tempSeries}    // Data to plot
        type="line" 
        height={350} 
      />
    </div>
  </div>
)}
```

**Explanation:** 
1. Raw data from API is transformed into ApexCharts format: `{ x: timestamp, y: value }`
2. Chart options configure appearance, axes, tooltips, zoom
3. `<Chart>` component from `react-apexcharts` renders the visualization
4. Same process for AQI and Rainfall graphs

**Example AQI Graph with Area Fill (Lines 327-382):**
```javascript
const aqiOptions = {
  ...commonOptions,
  chart: {
    ...commonOptions.chart,
    type: timeRange === '7d' || timeRange === '30d' ? 'area' : 'line'  // Area for short ranges
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
    }
  },
  annotations: {  // Add threshold lines
    yaxis: [
      { y: 50, borderColor: '#22c55e', label: { text: 'Good', style: { color: '#fff', background: '#22c55e' } } },
      { y: 100, borderColor: '#eab308', label: { text: 'Moderate' } },
      { y: 150, borderColor: '#f97316', label: { text: 'Unhealthy' } }
    ]
  }
};
```

### Q: Where is code for +, -, home, download buttons inside each graph?

**File:** `src/pages/HistoricalPage.jsx`  
**Lines:** 283-295

```javascript
const commonOptions = {
  chart: {
    zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
    toolbar: {
      show: true,  // Show toolbar
      autoSelected: 'zoom',
      tools: {
        download: true,   // Download icon (exports chart as PNG/SVG)
        selection: false,
        zoom: false,
        zoomin: true,     // + button
        zoomout: true,    // - button
        pan: false,
        reset: true       // Home button (resets zoom)
      }
    }
  }
};
```

**Explanation:** ApexCharts library automatically provides these toolbar buttons when `toolbar.show: true` and respective tool is enabled.

### Q: Where is code for CSV/JSON download in History page?

**File:** `src/components/DownloadDataButtons.jsx`  
**Lines:** 6-57

**CSV Download (Lines 25-57):**
```javascript
const handleDownloadCSV = () => {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add header
  csvContent += "Type,Source,Value1,Value2,Value3,LastUpdated\n";
  
  // Add weather data
  if (city.weather && Array.isArray(city.weather)) {
    city.weather.forEach(w => {
      csvContent += `Weather,${w.source},Temp:${w.temp},Humidity:${w.humidity},Wind:${w.windSpeed},${w.lastUpdated}\n`;
    });
  }
  
  // Add historical data
  if (historicalData && Array.isArray(historicalData)) {
    csvContent += "\nHistorical Data\nDate,Temp,AQI,Rainfall\n";
    historicalData.forEach(h => {
      csvContent += `${h.date},${h.temp_om || '-'},${h.aqi_om || '-'},${h.rain_om || '-'}\n`;
    });
  }
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `atmosview_${city.id}_data.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
```

**JSON Download (Lines 6-23):**
```javascript
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
```

**Explanation:** 
- CSV: Builds CSV string with headers and data, creates data URI, triggers download
- JSON: Converts data object to JSON string with formatting, creates Blob, triggers download

**Where buttons are rendered (Lines 60-77):**
```javascript
return (
  <div className="flex gap-3 mt-4 sm:mt-0">
    <button onClick={handleDownloadCSV} className="flex items-center gap-2...">
      <FileSpreadsheet className="w-4 h-4" />
      CSV
    </button>
    <button onClick={handleDownloadJSON} className="flex items-center gap-2...">
      <FileJson className="w-4 h-4" />
      JSON
    </button>
  </div>
);
```

**Where it's used in HistoricalPage (Line 399):**
```javascript
<DownloadDataButtons city={selectedCity} historicalData={historicalData} />
```

### Q: Where is code for Upload Research Data?

**File:** `src/pages/HistoricalPage.jsx`  
**Lines:** 504-576

**Upload UI (Lines 504-574):**
```javascript
{dataSource === 'researcher' && (
  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border...">
    <form onSubmit={handleUploadSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Type Selector */}
        <div>
          <label>Data Type (for organization)</label>
          <select
            value={uploadDataType}
            onChange={(e) => setUploadDataType(e.target.value)}
          >
            <option value="temperature">Temperature</option>
            <option value="aqi">Air Quality (AQI)</option>
            <option value="rainfall">Rainfall</option>
          </select>
        </div>

        {/* File Input */}
        <div>
          <label>CSV File (containing date, temperature, aqi, etc.)</label>
          <input
            id="upload-file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <button type="submit" disabled={uploading || !uploadFile}>
        {uploading ? 'Uploading...' : 'Upload Data'}
      </button>
    </form>
  </div>
)}
```

**File Change Handler (Lines 170-179):**
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && !file.name.endsWith('.csv')) {
    setUploadError('Please upload a CSV file');
    return;
  }
  setUploadFile(file);
  setUploadError('');
  setUploadSuccess('');
};
```

**Upload Submit Handler (Lines 181-228):**
```javascript
const handleUploadSubmit = async (e) => {
  e.preventDefault();
  if (!uploadFile) {
    setUploadError('Please select a CSV file');
    return;
  }

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('city', selectedCity.name);
    formData.append('dataType', uploadDataType);
    formData.append('timeRange', timeRange);

    const response = await uploadData(formData);  // API call
    setUploadSuccess(`Successfully uploaded ${response.data.recordCount} records!`);
    
    // Reload data after upload
    const res = await getResearchData(selectedCity.name, timeRange, null);
    if (res.success && res.data.length > 0) {
      const formattedData = res.data.flatMap(upload => upload.data || []);
      setHistoricalData(formattedData);
    }
  } catch (err) {
    setUploadError(err.message || 'Upload failed. Please try again.');
  } finally {
    setUploading(false);
  }
};
```

**Explanation:** Form with file input and data type selector. On submit, creates FormData with file and metadata, sends to backend API, then reloads the historical data to display uploaded values.

---

## 6. Compare Page Features

### Q: Where is code for Compare Cities?

**File:** `src/pages/ComparePage.jsx`  
**Lines:** 132-218

**City Selection UI (Lines 132-218):**
```javascript
<div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
  {/* City A Search */}
  <div className="w-full md:w-80">
    <label>City A</label>
    <div className="relative">
      <input
        type="text"
        placeholder="Search Indian city..."
        value={searchQueryA}
        onChange={handleSearchA}
      />
      
      {/* Search Results for City A */}
      {searchResultsA.length > 0 && (
        <div className="absolute z-10 w-full...">
          {searchResultsA.map((city) => (
            <button onClick={() => selectCityA(city)}>
              {city.name}, {city.state}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>

  <ArrowRight className="text-slate-400" />

  {/* City B Search - Same structure */}
  <div className="w-full md:w-80">
    {/* ... similar structure for City B ... */}
  </div>
</div>
```

**Search Handlers (Lines 65-114):**
```javascript
const handleSearchA = (e) => {
  const query = e.target.value;
  setSearchQueryA(query);

  if (query.length < 2) {
    setSearchResultsA([]);
    return;
  }

  setIsSearchingA(true);
  setTimeout(async () => {
    const results = await searchCities(query);  // API call
    setSearchResultsA(results);
    setIsSearchingA(false);
  }, 500);  // Debounce
};

const selectCityA = (city) => {
  setCityA(city);
  setSearchQueryA('');
  setSearchResultsA([]);
};

// Same for City B with handleSearchB and selectCityB
```

**Data Fetching (Lines 29-62):**
```javascript
// Fetch data for City A when cityA changes
useEffect(() => {
  const fetchData = async () => {
    setDataA(prev => ({ ...prev, loading: true }));
    try {
      const [weather, aqi] = await Promise.all([
        fetchCurrentWeather(cityA.lat, cityA.lon),
        fetchCurrentAQI(cityA.lat, cityA.lon)
      ]);
      setDataA({ weather, aqi, loading: false });
    } catch (error) {
      setDataA({ weather: null, aqi: null, loading: false });
    }
  };
  fetchData();
}, [cityA]);

// Same effect for City B
```

**Comparison Display (Lines 226-234 and 238-254):**
```javascript
{/* Display both cities side-by-side */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <ComparisonCard city={cityA} weather={dataA.weather} aqi={dataA.aqi} />
  <ComparisonCard city={cityB} weather={dataB.weather} aqi={dataB.aqi} />
</div>

{/* Comparison Insight */}
{!isLoading && dataA.weather && dataB.weather && (
  <div className="bg-blue-50 border...">
    <h3>Comparison Insight</h3>
    <p>
      {tempDiff > 0
        ? `${cityB.name} is ${tempDiff}°C hotter than ${cityA.name}.`
        : `${cityB.name} is ${Math.abs(tempDiff)}°C cooler than ${cityA.name}.`}
    </p>
    <p>
      {aqiDiff > 0
        ? `${cityB.name} has worse air quality (+${aqiDiff} AQI) compared to ${cityA.name}.`
        : `${cityB.name} has better air quality (${Math.abs(aqiDiff)} AQI) compared to ${cityA.name}.`}
    </p>
  </div>
)}
```

**ComparisonCard Component (Lines 259-325):**
```javascript
const ComparisonCard = ({ city, weather, aqi }) => {
  return (
    <div className="bg-white p-6 rounded-xl border...">
      <h2>{city.name}</h2>
      
      <div className="space-y-6">
        {/* Temperature */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Thermometer className="text-orange-500..." />
            <span>Temperature</span>
          </div>
          <span className="text-xl font-bold">{weather.temp}°C</span>
        </div>
        
        {/* Humidity */}
        <div className="flex items-center justify-between">
          <Droplets className="text-blue-500..." />
          <span>Humidity</span>
          <span>{weather.humidity}%</span>
        </div>
        
        {/* Wind */}
        <div className="flex items-center justify-between">
          <Wind />
          <span>Wind</span>
          <span>{weather.windSpeed} km/h</span>
        </div>
        
        {/* AQI */}
        <div className="flex items-center justify-between">
          <Activity className="text-purple-500..." />
          <span>AQI</span>
          <span>{aqi.aqi}</span>
        </div>
        
        {/* Pollutants */}
        <div className="grid grid-cols-3 gap-2">
          <div>PM2.5: {aqi.pm25}</div>
          <div>PM10: {aqi.pm10}</div>
          <div>NO2: {aqi.no2}</div>
        </div>
      </div>
    </div>
  );
};
```

**Explanation:** Two search inputs for City A and City B, each with debounced search. When cities are selected, fetches their data in parallel, displays side-by-side comparison cards, and calculates/shows comparison insights.

---

## Summary

This guide covers all major features of your AtmosView application:

1. **Navigation**: Cards on landing page and navbar links use React Router
2. **Authentication**: User display, researcher badge, logout functionality
3. **Dashboard**: Favorites, search, weather metrics with source modals, hourly/daily forecasts, interactive map
4. **Historical**: Time range selection, ApexCharts for data visualization, CSV/JSON downloads, research data upload
5. **Compare**: Dual city search, parallel data fetching, side-by-side comparison with insights

All code is properly organized into pages and reusable components. Good luck with your viva!

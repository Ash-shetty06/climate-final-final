# Viva Preparation: Code Walkthrough

This document explains the code location and logic for each feature you requested.

---

## 📂 Project Structure & File Roles

This section explains what each folder contains and what key files do.

### **Root Directory**
- **`src/`**: Contains all the Frontend (React) code. This is what the user sees in the browser.
- **`backend/`**: Contains the Server (Node.js/Express) code. This handles the database and API keys.
- **`App.jsx`**: The main container for the frontend application. It sets up the routing (navigation) between pages.
- **`package.json`**: Lists all the libraries (dependencies) installed in the project.
- **`start.sh`**: A helper script to start both the frontend and backend servers at once.

### **Frontend (`src/`)**
- **`pages/`**: Full-page components. Each file here corresponds to a route (URL).
  - `LandingPage.jsx`: The first page you see with the 4 cards.
  - `DashboardPage.jsx`: The main weather dashboard.
  - `HistoricalPage.jsx`: The graphs and research data page.
  - `ComparePage.jsx`: The city comparison tool.
  - `LoginPage.jsx` / `RegisterPage.jsx`: Authentication pages.
- **`components/`**: Reusable UI blocks used inside pages.
  - `Navbar.jsx`: The top navigation bar.
  - `HealthAdvicePanel.jsx`: The box showing health tips based on AQI.
  - `IndiaMapSelector.jsx`: The interactive map component.
  - `SummaryCard.jsx`: The small white cards showing Temp, Humidity, etc.
- **`services/`**: Files that talk to the backend or external APIs.
  - `weatherApi.js`: Fetches weather data from Open-Meteo or the backend.
  - `authService.js`: Handles login, registration, and storing user tokens.
  - `researchDataService.js`: Handles uploading and fetching CSV files.

### **Backend (`backend/`)**
- **`server.js`**: The entry point of the backend. It starts the server and connects to the database.
- **`models/`**: Defines the structure of data stored in MongoDB (e.g., User, WeatherData).
- **`routes/`**: Defines the API endpoints (URLs like `/api/auth/login`).
- **`controllers/`**: The actual logic for each API endpoint (e.g., checking passwords, saving files).
- **`middleware/`**: Code that runs before controllers, like checking if a user is logged in (`auth.js`).

---

### 1. Multi-Source Weather Card Navigation
**Question:** When I click on the first card (Multi-Source Weather), how does it take me to the dashboard?
**Location:** `src/pages/LandingPage.jsx` (Lines 42-47)
**Code:**
```javascript
<FeatureCard
  title="Multi-Source Weather"
  onClick={() => navigate('/dashboard')}
/>
```
**Explanation:**
- The `onClick` prop triggers an arrow function.
- `navigate('/dashboard')` uses the React Router hook to change the browser URL to `/dashboard`, loading the Dashboard page.

---

### 2. User Profile ("manoj420")
**Question:** Where is the code for the user profile name (e.g., "manoj420") at the top?
**Location:** `src/components/Navbar.jsx` (Line 52)
**Code:**
```javascript
<span className="text-sm font-medium text-slate-700">
  {user.username}
</span>
```
**Explanation:**
- `{user.username}` dynamically inserts the `username` property from the logged-in `user` object state.
- If you are logged in as "manoj420", this variable holds that string and displays it.

---

### 3. Researcher (Upload Content)
**Question:** Where is the code for the Researcher upload section and functionality?
**Location:** `src/pages/HistoricalPage.jsx` (Lines 504-508 for UI, 181-228 for Logic)
**Code:**
```javascript
// Toggle UI
{dataSource === 'researcher' && ( ... )}

// File Input
<input type="file" accept=".csv" onChange={handleFileChange} />

// Logic (handleUploadSubmit)
const response = await uploadData(formData);
```
**Explanation:**
- The code checks if `dataSource === 'researcher'` to reveal the upload form.
- The `handleUploadSubmit` function wraps the file in a `FormData` object and sends it to the backend via `uploadData`.

---

### 4. Logout Functionality
**Question:** Where is the logout code?
**Location:** `src/components/Navbar.jsx` (Lines 17-21 and 60)
**Code:**
```javascript
const handleLogout = () => {
  logout();      // Clears token from storage
  setUser(null); // Updates local state
  navigate('/'); // Redirects to Home
};
```
**Explanation:**
- The `handleLogout` function calls the `logout` service to remove authentication tokens.
- It then updates the React state to reflect the user is gone and redirects to the landing page.

---

### 5. Navigation Links (Home, Dashboard, etc.)
**Question:** Where is the code for the top links: Home, Dashboard, Historical, Compare?
**Location:** `src/components/Navbar.jsx` (Lines 41-46)
**Code:**
```javascript
<Link to="/" className={getLinkClass('/')}>Home</Link>
<Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
<Link to="/historical" className={getLinkClass('/historical')}>Historical</Link>
<Link to="/compare" className={getLinkClass('/compare')}>Compare</Link>
```
**Explanation:**
- The `<Link>` component from `react-router-dom` creates clickable navigation links without reloading the page.
- `getLinkClass` conditionally applies highlighting styles if the link is active.

---

### 6. Add to Favorites (Heart Icon)
**Question:** In the dashboard, where is the heart code to add favorite cities?
**Location:** `src/pages/DashboardPage.jsx` (Lines 83-115 for Logic, 234-236 for UI)
**Code:**
```javascript
// Function
const toggleFavorite = async () => { ... await addFavorite(cityData); ... }

// UI Element
<button onClick={toggleFavorite}>
  <Heart className={isCurrentFavorite ? 'fill-red-500' : 'text-slate-400'} />
</button>
```
**Explanation:**
- `toggleFavorite` checks if the city is already a favorite.
- It calls API functions `addFavorite` or `removeFavorite` accordingly and updates the local state to change the heart color (red if favorite).

---

### 7. Search Bar
**Question:** Where is the search bar code?
**Location:** `src/pages/DashboardPage.jsx` (Lines 246-253)
**Code:**
```javascript
<input
  type="text"
  placeholder="Search city..."
  value={searchQuery}
  onChange={handleSearch}
/>
```
**Explanation:**
- The input field is bound to the `searchQuery` state variable.
- `onChange` triggers `handleSearch`, which updates the query and calls the API to find matching cities.

---

### 8. 24 Hours Weather
**Question:** Where is the code for the 24-hour weather forecast?
**Location:** `src/pages/DashboardPage.jsx` (Line 129 Fetch, Line 300 UI)
**Code:**
```javascript
// Fetching
fetchHourlyForecast(lat, lon)

// Rendering
<HourlyForecast data={hourlyForecast} />
```
**Explanation:**
- The data is fetched alongside other weather data in the `useEffect`.
- The `<HourlyForecast>` component receives this data as a prop and renders the scrollable hourly cards.

---

### 9. 7 Days Forecast
**Question:** Where is the code for the 7-day forecast?
**Location:** `src/pages/DashboardPage.jsx` (Line 130 Fetch, Line 303 UI)
**Code:**
```javascript
// Fetching
fetchDailyForecast(lat, lon)

// Rendering
<DailyForecast data={dailyForecast} />
```
**Explanation:**
- Similar to hourly, `fetchDailyForecast` gets the week's data.
- The `<DailyForecast>` component displays the list of upcoming days.

---

### 10. Current Weather & Metrics (Source Modal)
**Question:** When we click on each card (like Temp, Humidity) to see the source, where is that?
**Location:** `src/pages/DashboardPage.jsx` (Lines 314-319, Logic 180-187)
**Code:**
```javascript
<SummaryCard
  title="Temperature"
  onClick={() => openModal('temp')} // Opens modal for specific metric
/>
// Modal Component
<SourceModal isOpen={isModalOpen} metric={modalMetric} ... />
```
**Explanation:**
- The `onClick` handler calls `openModal` with the metric name (e.g., 'temp').
- This state change causes the `<SourceModal>` to appear, showing data sources for that specific metric.

---

### 11. Select Location
**Question:** Where is the code for "Select Location"?
**Location:** `src/pages/DashboardPage.jsx` (Lines 430-452)
**Code:**
```javascript
<IndiaMapSelector
  onCitySelect={(id) => { ... }}
  onLocationSelect={(lat, lon) => { ... }}
/>
```
**Explanation:**
- The Dashboard embeds the `<IndiaMapSelector>` component.
- It passes callback functions (`onCitySelect`, `onLocationSelect`) that update the `currentLocation` state in the Dashboard when a user clicks the map.

---

### 12. Maps Type
**Question:** Inside the map, where is the code for changing map types?
**Location:** `src/components/IndiaMapSelector.jsx` (Lines 175-203)
**Code:**
```javascript
<LayersControl position="topright">
  <LayersControl.BaseLayer checked name="Clean (Positron)"> ... </LayersControl.BaseLayer>
  <LayersControl.BaseLayer name="Satellite (Esri)"> ... </LayersControl.BaseLayer>
</LayersControl>
```
**Explanation:**
- Leaflet's `LayersControl` provides the UI to switch layers.
- `BaseLayer` components define the different map tile URLs (e.g., Satellite vs. Clean).

---

### 13. Blue Circles (Map Markers)
**Question:** Inside the map, there are blue circles. Where is the code?
**Location:** `src/components/IndiaMapSelector.jsx` (Lines 216-223)
**Code:**
```javascript
{CITIES.map(c => (
  <CircleMarker
    key={c.id}
    center={[c.lat, c.lon]}
    taskId={c.id} // logic
  />
))}
```
**Explanation:**
- The code iterates over the `CITIES` constant list.
- For each city, it renders a `<CircleMarker>` from React-Leaflet at the correct latitude/longitude.

---

### 14. Select City with Cursor
**Question:** Inside the map, we can select any city with the cursor. Where is that code?
**Location:** `src/components/IndiaMapSelector.jsx` (Lines 38-45, 108-149)
**Code:**
```javascript
// Component to capture clicks
useMapEvents({
  click(e) { onMapClick(e.latlng.lat, e.latlng.lng); }
});

// Handler Logic
const handleMapClick = async (lat, lon) => {
   // Finds nearest city and updates state
}
```
**Explanation:**
- `useMapEvents` hooks into the Leaflet map instance to detect clicks anywhere on the map.
- The `handleMapClick` logic calculates distances to defined cities to snap to them or uses the exact coordinates.

---

### 15. History Page - Select Range
**Question:** In the history page, where is the code for selecting the range (e.g., 1 year)?
**Location:** `src/pages/HistoricalPage.jsx` (Lines 462-474)
**Code:**
```javascript
<select
  value={timeRange}
  onChange={(e) => setTimeRange(e.target.value)}
>
  <option value="1yr">Last 1 Year</option>
  ...
</select>
```
**Explanation:**
- A standard HTML `<select>` element is used.
- Changing the selection updates the `timeRange` state, which triggers a `useEffect` to refetch data for that new period.

---

### 16. Graphs Visualization
**Question:** How are graphs visualized and data converted?
**Location:** `src/pages/HistoricalPage.jsx` (Lines 596, Logic 236-240)
**Code:**
```javascript
// Data Conversion
const tempSeries = [
  { name: 'Temp', data: historicalData.map(d => ({ x: d.date, y: d.temp_om })) }
];

// Visualization
<Chart options={tempOptions} series={tempSeries} type="line" />
```
**Explanation:**
- `historicalData` (array of objects) is `map`ped into the format ApexCharts expects (`{x, y}`).
- The `<Chart>` component (from `react-apexcharts`) takes these `series` and `options` to render the SVG/Canvas graph.

---

### 17. Download Data (CSV/JSON)
**Question:** Where is the code for the download options?
**Location:** `src/pages/HistoricalPage.jsx` (Line 399)
**Code:**
```javascript
<DownloadDataButtons
  city={selectedCity}
  historicalData={historicalData}
/>
```
**Explanation:**
- The functionality is encapsulated in the `DownloadDataButtons` component.
- We pass the current dataset `historicalData` to it, and that component handles the file generation and download triggering.

---

### 18. Visualization Options (+, -, Home)
**Question:** Inside each visualization, there are options like +, -, home. Where is that?
**Location:** `src/pages/HistoricalPage.jsx` (Lines 283-294 inside `commonOptions`)
**Code:**
```javascript
toolbar: {
  show: true,
  tools: {
    download: true,
    zoom: true,
    reset: true // 'Home' icon
  }
}
```
**Explanation:**
- These are built-in features of the ApexCharts library.
- They are enabled via the `chart.toolbar` configuration object passed to the `options` prop.

---

### 19. Compare Cities
**Question:** Where is the code for compare cities?
**Location:** `src/pages/ComparePage.jsx` (Lines 226-234, Logic 119-125)
**Code:**
```javascript
// Logic
const tempDiff = (dataB.temp - dataA.temp);

// UI
<ComparisonCard city={cityA} ... />
<ComparisonCard city={cityB} ... />
```
**Explanation:**
- The page renders two `<ComparisonCard>` components side-by-side.
- It calculates the value differences (logic lines) and displays a "Comparison Insight" text block at the bottom.

---

### 20. Health & Activity Advice
**Question:** Where is the code for the health advices?
**Location:** `src/components/HealthAdvicePanel.jsx` (Entire file, specifically lines 8-37 for logic)
**Code:**
```javascript
// AQI Advice Logic
if (aqi <= 50) {
  aqiAdvice = "Air quality is excellent...";
} else if (aqi <= 100) { ... }

// Weather Advice Logic
if (temp > 35) weatherAdvice.push("Extreme heat!...");
```
**Explanation:**
- The `HealthAdvicePanel` component takes `aqi`, `temp`, and `humidity` as props.
- It uses a series of `if-else` statements to determine the appropriate advice string and color theme (e.g., green for good, red for bad).
- It renders these advice strings in a styled panel.

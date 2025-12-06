# AtmosView 🌤️

**AtmosView** is a comprehensive climate and weather research application designed to provide researchers and users with real-time weather analytics, historical climate trends, and data comparison tools. It leverages multiple disparate data sources (Open-Meteo, MET Norway, WAQI) to offer a unified, high-accuracy view of atmospheric conditions.

![AtmosView Dashboard](https://via.placeholder.com/800x400?text=AtmosView+Dashboard+Preview)

## 🚀 Key Features

*   **Real-time Dashboard:** Live tracking of Temperature, AQI, Humidity, Wind Speed, UV Index, and more.
*   **Multi-Source Data Aggregation:** Fetches data from:
    *   **Open-Meteo:** Global weather data (Temperature, Rain, etc.)
    *   **MET Norway:** High-precision Nordic weather models.
    *   **WAQI (AQICN):** Real-time Air Quality Index monitoring.
    *   **Visual Crossing:** Historical weather data (for premium analysis).
*   **Interactive India Map:** Click-to-select functionality for exploring weather conditions across Indian cities.
*   **Research & Upload:** Researchers can upload their own CSV datasets to compare field data against API baselines.
*   **Historical Analysis:** View climate trends over the last 30 days to 10 years.
*   **User Favorites:** Save your frequently monitored cities for quick access.
*   **Secure Authentication:** JWT-based login/register system with role-based access (User vs. Researcher).

## 🛠️ Tech Stack

### Frontend
*   **React (Vite):** Fast, modern UI development.
*   **TailwindCSS:** Utility-first styling for a sleek, responsive design.
*   **Recharts / ApexCharts:** Interactive data visualization.
*   **Leaflet / React-Simple-Maps:** Map integration.
*   **Lucide React:** Beautiful, consistent iconography.

### Backend
*   **Node.js & Express:** Robust REST API architecture.
*   **MongoDB Atlas:** Cloud-native database for storing users and research data.
*   **Mongoose:** Schema-based data modeling.
*   **JWT & Bcrypt:** Security and authentication.

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Ash-shetty06/climate-final-final.git
    cd climate-final-final
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    cp .env.example .env
    # Edit .env with your MongoDB URI and API Keys (optional)
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    # In a new terminal
    npm install
    npm run dev
    ```

4.  **Access the App**
    Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🔑 Environment Variables (.env)

| Variable | Description |
|:---|:---|
| `MONGO_URI` | Connection string for MongoDB Atlas. |
| `JWT_SECRET` | Secret key for signing authentication tokens. |
| `VISUAL_CROSSING_KEY` | (Optional) Key for historical data API. |
| `WAQI_KEY` | (Optional) Key for Air Quality API. |

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

---

*Built with ❤️ for Climate Research.*

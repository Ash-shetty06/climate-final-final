import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './src/components/Navbar';
import LandingPage from './src/pages/LandingPage';
import DashboardPage from './src/pages/DashboardPage';
import HistoricalPage from './src/pages/HistoricalPage';
import ComparePage from './src/pages/ComparePage';

import Footer from './src/components/Footer';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/historical" element={<HistoricalPage />} />
            <Route path="/compare" element={<ComparePage />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;

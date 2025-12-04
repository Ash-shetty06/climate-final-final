import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CloudRain, Wind, Map, ArrowRight } from 'lucide-react';
import { DATA_SOURCES } from '../utils/constants';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {}
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
          AtmosView
        </h1>
        <h2 className="text-2xl md:text-3xl font-medium text-slate-600 mb-6">
          Real-time Weather & Air Quality Intelligence
        </h2>
        <p className="max-w-2xl text-lg text-slate-500 mb-10 leading-relaxed">
          AtmosView provides multi-source weather, air quality data, historical climate trends, and city comparison tools to help you make informed decisions based on environmental data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/compare')}
            className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold text-lg hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
          >
            Compare Cities
          </button>
        </div>
      </main>

      {}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<CloudRain className="w-8 h-8 text-blue-500" />}
            title="Multi-Source Weather"
            description="Aggregated data from IMD, OpenWeather, and more."
            onClick={() => navigate('/dashboard')}
          />
          <FeatureCard
            icon={<Wind className="w-8 h-8 text-green-500" />}
            title="Multi-Source AQI"
            description="Real-time pollution tracking from verified sensors."
            onClick={() => navigate('/dashboard')}
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-purple-500" />}
            title="Historical Explorer"
            description="Analyze climate trends over the last decade."
            onClick={() => navigate('/historical')}
          />
          <FeatureCard
            icon={<Map className="w-8 h-8 text-orange-500" />}
            title="City Comparison"
            description="Side-by-side environmental analytics."
            onClick={() => navigate('/compare')}
          />
        </div>
      </section>

      {}
    </div>
  );
};

const FeatureCard = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
  >
    <div className="mb-4 bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 leading-snug">{description}</p>
  </div>
);

export default LandingPage;

import React from 'react';
import { DATA_SOURCES } from '../utils/constants';

const Footer = () => {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 py-6">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Trusted Data Sources</p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-slate-400 font-medium">
          {DATA_SOURCES.map((source) => (
            <span key={source} className="hover:text-slate-600 transition-colors cursor-default">{source}</span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

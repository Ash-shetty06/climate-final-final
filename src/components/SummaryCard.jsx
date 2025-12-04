import React from 'react';

const SummaryCard = ({ title, value, unit, subtitle, onClick, selected, icon }) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative group bg-white p-3 rounded-lg border shadow-sm flex items-start justify-between gap-4 transition-all duration-150 ease-in-out ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''} ${selected ? 'ring-2 ring-blue-300' : ''}`}
    >
      <span
        onClick={onClick}
        className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] px-2 py-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium"
      >
        View Sources
      </span>
      <div className="flex flex-col items-start">
        <div className="text-xs text-slate-500 uppercase font-semibold">{title}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-slate-800">{value}</div>
          {unit && <div className="text-sm text-slate-500">{unit}</div>}
        </div>
        {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
      </div>

      {icon && <div className="text-3xl text-slate-400">{icon}</div>}
    </div>
  );
};

export default SummaryCard;

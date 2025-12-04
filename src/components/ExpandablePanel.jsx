import React from 'react';

const ExpandablePanel = ({ isOpen, children }) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out transform overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      {isOpen && (
        <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 border-l-4 border-blue-500 mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default ExpandablePanel;

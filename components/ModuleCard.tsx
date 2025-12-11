
import React from 'react';
import type { Module } from '../types';

interface ModuleCardProps {
  module: Module;
  onSelect: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer text-center flex flex-col items-center h-full border-t-4 border-transparent hover:border-purple-600"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="text-purple-800 mb-5">{module.icon}</div>
      <h2 className="font-bold text-xl text-blue-900 mb-2">{module.title}</h2>
      <p className="text-sm text-blue-900 flex-grow">{module.description}</p>
    </div>
  );
};

export default ModuleCard;

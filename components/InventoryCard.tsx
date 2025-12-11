
import React from 'react';

interface InventoryCardProps {
  title: string;
  count: number;
  icon: React.ReactElement<{ className?: string }>;
  onClick: () => void;
  color: string;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ title, count, icon, onClick, color }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 flex flex-col items-start"
    >
      <div className={`rounded-lg p-3 mb-4 ${color}`}>
        {React.cloneElement(icon, { className: 'h-8 w-8 text-white' })}
      </div>
      <h3 className="font-bold text-lg text-blue-900 dark:text-white">{title}</h3>
      <p className="text-blue-900 dark:text-gray-400 mt-1 text-sm">{count} items</p>
    </div>
  );
};

export default InventoryCard;

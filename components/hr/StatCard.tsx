
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  percentage: number;
  color: string;
}

const CircularProgress: React.FC<{ percentage: number; color: string; displayText: string }> = ({ percentage, color, displayText }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg className="w-20 h-20 transform -rotate-90">
            <circle
                className="text-blue-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
            />
            <circle
                className={color}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="40"
                cy="40"
            />
             <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                className="text-lg font-bold text-blue-900 transform rotate-90 origin-center"
            >
                {displayText}
            </text>
        </svg>
    );
};


const StatCard: React.FC<StatCardProps> = ({ title, value, percentage, color }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm flex items-center">
      <div className="flex-shrink-0">
        <CircularProgress percentage={percentage} color={color} displayText={value} />
      </div>
      <div className="ml-4 text-left">
        <p className="text-sm text-blue-900">{title}</p>
        {/* Value is already shown inside circle, we can keep title distinct or show additional info here if needed */}
      </div>
    </div>
  );
};

export default StatCard;

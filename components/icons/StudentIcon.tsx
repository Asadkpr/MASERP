
import React from 'react';

export const StudentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path d="M12 14.25c-3.75 0-7.5-1.34-7.5-3v-4.5c0-1.66 3.35-3 7.5-3s7.5 1.34 7.5 3v4.5c0 1.65-3.75 3-7.5 3z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 10.5v6.75c0 1.65 3.75 3 7.5 3s7.5-1.35 7.5-3V10.5M4.5 10.5L12 15l7.5-4.5"
    />
  </svg>
);

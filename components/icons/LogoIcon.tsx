
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12 1.5l2.12 6.4H21l-5.37 3.94 2.12 6.4-5.75-4.22-5.75 4.22 2.12-6.4L3 7.9h6.88L12 1.5zm0 3.82l-1.41 4.28H6.3l3.63 2.65-1.42 4.28L12 13.9l3.49 2.63-1.42-4.28L17.7 9.6h-4.29L12 5.32z" />
    <path d="M12 1.5l-2.12 6.4H3l5.37 3.94-2.12 6.4 5.75-4.22 5.75 4.22-2.12-6.4L21 7.9h-6.88L12 1.5zm0 3.82L13.41 9.6h4.29l-3.63 2.65 1.42 4.28L12 13.9 8.51 16.53l1.42-4.28L6.3 9.6h4.29L12 5.32z" transform="rotate(60 12 12)" />
  </svg>
);

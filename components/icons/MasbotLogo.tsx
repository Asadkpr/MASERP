
import React, { useState } from 'react';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const MasbotLogo: React.FC<LogoProps> = ({ className, onClick, style, title }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
     return (
        <svg
            viewBox="0 0 300 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="MASERP"
            onClick={onClick as unknown as React.MouseEventHandler<SVGSVGElement>}
            style={style}
            role="img"
        >
            {title && <title>{title}</title>}
            {/* Icon Group */}
            <g>
               <path d="M42 12L70 28V60L42 76L14 60V28L42 12Z" fill="#1E3A8A"/>
               <path d="M42 30L54 38V50L42 58L30 50V38L42 30Z" fill="#FFFFFF"/>
            </g>
            
            {/* Text Group - Updated to MASERP */}
            <text x="90" y="55" fill="#1E3A8A" fontFamily="sans-serif" fontWeight="bold" fontSize="42">MASERP</text>
        </svg>
     );
  }

  return (
    <img
      src="/logo.png"
      alt="MASERP"
      className={`object-contain ${className || ''}`}
      onError={() => setImgError(true)}
      onClick={onClick}
      style={style}
      title={title}
    />
  );
};

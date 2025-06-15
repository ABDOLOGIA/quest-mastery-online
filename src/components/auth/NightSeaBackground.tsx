
import React from 'react';

const NightSeaBackground: React.FC = () => {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800" />
      
      {/* Simplified animated elements for better performance */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Moon */}
      <div 
        className="absolute w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-2xl opacity-80"
        style={{
          top: '15%',
          right: '20%',
          boxShadow: '0 0 50px rgba(255, 255, 200, 0.4)'
        }}
      />

      {/* Water effect */}
      <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-slate-800 via-blue-900/50 to-transparent" />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
};

export default NightSeaBackground;

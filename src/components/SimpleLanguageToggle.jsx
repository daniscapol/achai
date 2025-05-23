import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const SimpleLanguageToggle = ({ className = '' }) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleToggle = () => {
    const newLang = currentLanguage === 'pt' ? 'en' : 'pt';
    changeLanguage(newLang);
  };

  // Calculate positions more precisely - making it bigger
  const toggleWidth = 140; // w-35 = 140px (increased from 112px)
  const thumbWidth = 44; // w-11 = 44px (increased from 36px)
  const padding = 8; // space from edges (increased from 6px)
  const leftPosition = padding;
  const rightPosition = toggleWidth - thumbWidth - padding;

  // Brazilian Flag SVG Component
  const BrazilFlag = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className="rounded-sm">
      <rect width="24" height="24" fill="#009639"/>
      <polygon points="12,4 22,12 12,20 2,12" fill="#FEDF00"/>
      <circle cx="12" cy="12" r="4" fill="#002776"/>
      <path d="M8 12 Q12 9 16 12 Q12 15 8 12" fill="#FEDF00" opacity="0.8"/>
    </svg>
  );

  // USA Flag SVG Component 
  const USAFlag = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className="rounded-sm">
      <rect width="24" height="24" fill="#B22234"/>
      <rect y="0" width="24" height="2" fill="#FFFFFF"/>
      <rect y="4" width="24" height="2" fill="#FFFFFF"/>
      <rect y="8" width="24" height="2" fill="#FFFFFF"/>
      <rect y="12" width="24" height="2" fill="#FFFFFF"/>
      <rect y="16" width="24" height="2" fill="#FFFFFF"/>
      <rect y="20" width="24" height="2" fill="#FFFFFF"/>
      <rect width="10" height="12" fill="#3C3B6E"/>
      <g fill="#FFFFFF">
        <circle cx="2" cy="2" r="0.5"/>
        <circle cx="5" cy="2" r="0.5"/>
        <circle cx="8" cy="2" r="0.5"/>
        <circle cx="2" cy="5" r="0.5"/>
        <circle cx="5" cy="5" r="0.5"/>
        <circle cx="8" cy="5" r="0.5"/>
        <circle cx="2" cy="8" r="0.5"/>
        <circle cx="5" cy="8" r="0.5"/>
        <circle cx="8" cy="8" r="0.5"/>
      </g>
    </svg>
  );

  return (
    <motion.button
      onClick={handleToggle}
      className={`
        relative rounded-full transition-all duration-300 
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
        cursor-pointer shadow-xl border-2 border-zinc-600/30
        bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800
        hover:from-zinc-700 hover:via-zinc-600 hover:to-zinc-700
        hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-500/40
        active:scale-95 transform transition-transform duration-150
        ${className}
      `}
      style={{ width: `${toggleWidth}px`, height: '52px' }} // Bigger height for better look
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      aria-label={`Switch to ${currentLanguage === 'en' ? 'Portuguese' : 'English'}`}
    >
      {/* Flag indicators on both ends - Real Flag Icons */}
      <div className="absolute inset-y-0 left-2 flex items-center justify-center z-10">
        <div 
          className={`transition-all duration-300 ${
            currentLanguage === 'pt' ? 'opacity-100 scale-110' : 'opacity-60 scale-90'
          }`}
          style={{ 
            filter: currentLanguage === 'pt' ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' : 'none'
          }}
        >
          <div className="p-1 bg-white/20 backdrop-blur-sm rounded-md border border-white/30 shadow-lg">
            <BrazilFlag size={28} />
          </div>
        </div>
      </div>
      <div className="absolute inset-y-0 right-2 flex items-center justify-center z-10">
        <div 
          className={`transition-all duration-300 ${
            currentLanguage === 'en' ? 'opacity-100 scale-110' : 'opacity-60 scale-90'
          }`}
          style={{ 
            filter: currentLanguage === 'en' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none'
          }}
        >
          <div className="p-1 bg-white/20 backdrop-blur-sm rounded-md border border-white/30 shadow-lg">
            <USAFlag size={28} />
          </div>
        </div>
      </div>

      {/* Moving Thumb with precise positioning */}
      <motion.div
        className="
          absolute bg-white rounded-full shadow-xl z-20
          flex items-center justify-center text-zinc-700 font-extrabold text-sm
          border border-zinc-200
        "
        style={{ 
          width: `${thumbWidth}px`, 
          height: `${thumbWidth}px`, 
          top: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
        }}
        animate={{
          x: currentLanguage === 'pt' ? leftPosition : rightPosition,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
      >
        <div className="flex items-center justify-center">
          {currentLanguage === 'pt' ? (
            <BrazilFlag size={20} />
          ) : (
            <USAFlag size={20} />
          )}
        </div>
      </motion.div>

      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10"
        animate={{
          opacity: currentLanguage === 'en' ? [0, 0.3, 0] : [0, 0.3, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: 0,
        }}
      />
    </motion.button>
  );
};

export default SimpleLanguageToggle;
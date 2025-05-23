import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';

const SimpleLanguageToggle = ({ className = '' }) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleToggle = () => {
    const newLang = currentLanguage === 'pt' ? 'en' : 'pt';
    changeLanguage(newLang);
  };

  // Calculate positions more precisely
  const toggleWidth = 112; // w-28 = 112px
  const thumbWidth = 36; // w-9 = 36px
  const padding = 6; // space from edges
  const leftPosition = padding;
  const rightPosition = toggleWidth - thumbWidth - padding;

  return (
    <motion.button
      onClick={handleToggle}
      className={`
        relative w-28 h-12 rounded-full transition-all duration-300 
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900
        cursor-pointer shadow-xl border-2 border-zinc-600/30
        bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800
        hover:from-zinc-700 hover:via-zinc-600 hover:to-zinc-700
        hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-500/40
        active:scale-95 transform transition-transform duration-150
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      aria-label={`Switch to ${currentLanguage === 'en' ? 'Portuguese' : 'English'}`}
    >
      {/* Flag indicators on both ends - Country Code Badges */}
      <div className="absolute inset-y-0 left-1 flex items-center justify-center z-10">
        <div 
          className={`transition-all duration-300 ${
            currentLanguage === 'pt' ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
          }`}
          style={{ 
            filter: currentLanguage === 'pt' ? 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.8))' : 'none'
          }}
        >
          {/* Brazil Badge */}
          <div className="px-2.5 py-1.5 bg-gradient-to-br from-green-500 to-yellow-400 rounded-md text-white text-sm font-extrabold border border-white/40 shadow-lg">
            BR
          </div>
        </div>
      </div>
      <div className="absolute inset-y-0 right-1 flex items-center justify-center z-10">
        <div 
          className={`transition-all duration-300 ${
            currentLanguage === 'en' ? 'opacity-100 scale-110' : 'opacity-50 scale-90'
          }`}
          style={{ 
            filter: currentLanguage === 'en' ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.8))' : 'none'
          }}
        >
          {/* USA Badge */}
          <div className="px-2.5 py-1.5 bg-gradient-to-br from-blue-500 to-red-500 rounded-md text-white text-sm font-extrabold border border-white/40 shadow-lg">
            US
          </div>
        </div>
      </div>

      {/* Moving Thumb with precise positioning */}
      <motion.div
        className="
          w-9 h-9 absolute top-1.5 bg-white rounded-full shadow-xl z-20
          flex items-center justify-center text-zinc-700 font-extrabold text-sm
          border border-zinc-200
        "
        animate={{
          x: currentLanguage === 'pt' ? leftPosition : rightPosition,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
        }}
      >
        <span className="text-zinc-700 font-extrabold">
          {currentLanguage === 'en' ? 'EN' : 'PT'}
        </span>
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
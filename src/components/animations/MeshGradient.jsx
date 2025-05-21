import React from 'react';
import { motion } from 'framer-motion';

/**
 * MeshGradient - Optimized background mesh gradient component 
 * that's more performance-friendly than the ones in PremiumAnimations
 */
const MeshGradient = ({ 
  className = "",
  color = "purple",
  intensity = "light",  // light, medium, strong
  animate = true
}) => {
  // Get color scheme based on parameter
  const getColorScheme = () => {
    switch(color) {
      case 'purple':
        return {
          primary: 'rgba(139, 92, 246,',
          secondary: 'rgba(79, 70, 229,',
          tertiary: 'rgba(67, 56, 202,'
        };
      case 'blue':
        return {
          primary: 'rgba(59, 130, 246,',
          secondary: 'rgba(37, 99, 235,',
          tertiary: 'rgba(29, 78, 216,'
        };
      case 'cyan':
        return {
          primary: 'rgba(34, 211, 238,',
          secondary: 'rgba(6, 182, 212,',
          tertiary: 'rgba(8, 145, 178,'
        };
      case 'pink':
        return {
          primary: 'rgba(236, 72, 153,',
          secondary: 'rgba(219, 39, 119,',
          tertiary: 'rgba(190, 24, 93,'
        };
      default:
        return {
          primary: 'rgba(139, 92, 246,',
          secondary: 'rgba(79, 70, 229,',
          tertiary: 'rgba(67, 56, 202,'
        };
    }
  };

  // Get intensity values
  const getIntensityValues = () => {
    switch(intensity) {
      case 'light':
        return {
          primary: '0.03',
          secondary: '0.02',
          tertiary: '0.015'
        };
      case 'medium':
        return {
          primary: '0.06',
          secondary: '0.04',
          tertiary: '0.03'
        };
      case 'strong':
        return {
          primary: '0.1',
          secondary: '0.08',
          tertiary: '0.06'
        };
      default:
        return {
          primary: '0.04',
          secondary: '0.03',
          tertiary: '0.02'
        };
    }
  };

  // Get color and intensity values
  const colorSet = getColorScheme();
  const intensitySet = getIntensityValues();

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Static base color */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
      
      {animate ? (
        <>
          {/* Animated blobs */}
          <motion.div
            className="absolute -top-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full opacity-70 will-change-transform"
            style={{
              background: `radial-gradient(circle at center, ${colorSet.primary}${intensitySet.primary}), transparent 70%)`,
              filter: 'blur(80px)'
            }}
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.div
            className="absolute bottom-[5%] right-[10%] w-[35vw] h-[35vw] rounded-full opacity-60 will-change-transform"
            style={{
              background: `radial-gradient(circle at center, ${colorSet.secondary}${intensitySet.secondary}), transparent 70%)`,
              filter: 'blur(70px)'
            }}
            animate={{
              x: [0, -25, 0],
              y: [0, 15, 0]
            }}
            transition={{
              duration: 50,
              repeat: Infinity,
              ease: "linear",
              delay: 2
            }}
          />
        </>
      ) : (
        <>
          {/* Static blobs for better performance */}
          <div
            className="absolute -top-[10%] left-[15%] w-[40vw] h-[40vw] rounded-full opacity-70"
            style={{
              background: `radial-gradient(circle at center, ${colorSet.primary}${intensitySet.primary}), transparent 70%)`,
              filter: 'blur(80px)'
            }}
          />
          
          <div
            className="absolute bottom-[5%] right-[10%] w-[35vw] h-[35vw] rounded-full opacity-60"
            style={{
              background: `radial-gradient(circle at center, ${colorSet.secondary}${intensitySet.secondary}), transparent 70%)`,
              filter: 'blur(70px)'
            }}
          />
        </>
      )}
      
      {/* Grid pattern for visual texture */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
};

export default MeshGradient;
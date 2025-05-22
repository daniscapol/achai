import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Animation keyframes for particle effects
const animationKeyframes = `
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

@keyframes floatParticle {
  0% { transform: translate(-50%, -50%) scale(1); }
  25% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
  50% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  75% { transform: translate(-50%, -50%) scale(0.9) rotate(-5deg); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes pulse {
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Color themes for different products
const productThemes = {
  'relevance-ai': {
    primary: 'from-indigo-600 to-purple-600',
    secondary: 'from-indigo-500 to-purple-500',
    accent: 'text-indigo-400',
    border: 'border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
    backgroundStart: 'from-indigo-900/40',
    backgroundEnd: 'to-purple-900/40',
    card: 'from-indigo-900/20 to-purple-900/20',
    highlight: 'bg-indigo-500'
  },
  'customgpt': {
    primary: 'from-blue-600 to-indigo-600',
    secondary: 'from-blue-500 to-indigo-500',
    accent: 'text-blue-400',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20',
    backgroundStart: 'from-blue-900/40',
    backgroundEnd: 'to-indigo-900/40',
    card: 'from-blue-900/20 to-indigo-900/20',
    highlight: 'bg-blue-500'
  },
  'aistudios': {
    primary: 'from-emerald-600 to-teal-600',
    secondary: 'from-emerald-500 to-teal-500',
    accent: 'text-emerald-400',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    backgroundStart: 'from-emerald-900/40',
    backgroundEnd: 'to-teal-900/40',
    card: 'from-emerald-900/20 to-teal-900/20',
    highlight: 'bg-emerald-500'
  },
  'rytr': {
    primary: 'from-orange-600 to-red-600',
    secondary: 'from-orange-500 to-red-500',
    accent: 'text-orange-400',
    border: 'border-orange-500/30',
    glow: 'shadow-orange-500/20',
    backgroundStart: 'from-orange-900/40',
    backgroundEnd: 'to-red-900/40',
    card: 'from-orange-900/20 to-red-900/20',
    highlight: 'bg-orange-500'
  }
};

// Animation for background elements
const BgAnimation = ({ children, delay = 0, duration = 20, className = "" }) => {
  return (
    <div 
      className={`absolute opacity-70 ${className}`}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  );
};

// Animated Particle component for premium background effect
const Particle = ({ size, color, speed, delay, top, left }) => {
  return (
    <div 
      className={`absolute rounded-full ${color} pointer-events-none`}
      style={{
        width: size,
        height: size,
        top: `${top}%`,
        left: `${left}%`,
        opacity: Math.random() * 0.5 + 0.1,
        animation: `floatParticle ${speed}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
};

// Background Particles container
const BackgroundParticles = ({ count = 30, productId }) => {
  const particles = [];
  const theme = productThemes[productId] || productThemes['relevance-ai'];
  const baseColorClass = 
    productId === 'relevance-ai' ? 'bg-indigo-500' : 
    productId === 'customgpt' ? 'bg-blue-500' : 
    productId === 'aistudios' ? 'bg-emerald-500' :
    'bg-orange-500';
  
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 8 + 2; // 2-10px
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const speed = Math.random() * 15 + 10; // 10-25s
    const delay = Math.random() * 5;
    const opacity = Math.random() * 0.3 + 0.05;
    
    particles.push(
      <Particle 
        key={i}
        size={size}
        color={baseColorClass}
        speed={speed}
        delay={delay}
        top={top}
        left={left}
        opacity={opacity}
      />
    );
  }
  
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {particles}
    </div>
  );
};

// Solution Selector Component
const SolutionSelector = ({ products, activeProductId, onSelectProduct }) => {
  // Get theme based on active product
  const theme = productThemes[activeProductId] || productThemes['relevance-ai'];
  
  return (
    <div className="mb-16 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-zinc-800/50 backdrop-blur-sm p-4 md:p-2 rounded-xl border border-zinc-700/50">
        {products.map(product => {
          const isActive = activeProductId === product.id;
          const productTheme = productThemes[product.id] || productThemes['relevance-ai'];
          
          return (
            <button
              key={product.id}
              onClick={() => onSelectProduct(product.id)}
              className={`px-6 py-4 rounded-lg transition-all duration-500 w-full md:w-auto text-center relative overflow-hidden ${
                isActive 
                  ? `bg-gradient-to-r ${productTheme.primary} text-white shadow-lg ${productTheme.glow}` 
                  : 'bg-zinc-800/70 text-gray-300 hover:bg-zinc-700/80'
              }`}
            >
              {/* Animated background for active button */}
              {isActive && (
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <div className="absolute -inset-[100%] opacity-20 animate-[spin_15s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
              )}
              
              <div className="flex flex-col items-center relative z-10">
                <div className="font-bold text-base">{product.name}</div>
                <div className="text-xs mt-1 opacity-80">{product.shortDescription}</div>
              </div>
            </button>
          );
        })}
      </div>
      <p className={`${theme.accent} text-center text-sm mt-3 font-medium`}>
        Select a solution to view its features and pricing
      </p>
    </div>
  );
};

// Product Detail Component with image preloading
const ProductDetail = ({ product, onGetStarted }) => {
  const theme = productThemes[product.id] || productThemes['relevance-ai'];
  const [imageLoaded, setImageLoaded] = useState(false);
  
  let images;
  
  if (product.id === 'relevance-ai') {
    images = [
      '/assets/affiliate-images/relevance-ai/build-ai-agent.svg',
      '/assets/affiliate-images/relevance-ai/relevance-labs.jpg',
      '/assets/affiliate-images/relevance-ai/relevance-ai-avatars.jpg',
    ];
  } else if (product.id === 'customgpt') {
    images = [
      '/assets/affiliate-images/customgpt/customgpt-opengraph.png',
      '/assets/affiliate-images/customgpt/customgpt-chatbot.webp',
    ];
  } else if (product.id === 'aistudios') {
    images = [
      '/assets/affiliate-images/aistudios/aistudios-deepbrain.png',
      '/assets/affiliate-images/aistudios/aistudios-humans.png',
    ];
  } else {
    images = [
      '/assets/affiliate-images/rytr/rytr-dashboard.png',
      '/assets/affiliate-images/rytr/rytr-interface.png',
      '/assets/affiliate-images/rytr/rytr-youtube.jpg',
    ];
  }
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    // Preload all images to prevent flickering during transitions
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [images]);
  
  return (
    <div className={`bg-gradient-to-br ${theme.backgroundStart} ${theme.backgroundEnd} rounded-2xl overflow-hidden shadow-xl mb-16 border ${theme.border} relative`}>
      {/* Animated background elements */}
      <BgAnimation className="top-20 right-10 w-64 h-64 rounded-full filter blur-[80px] bg-opacity-30" delay={0} duration={15}>
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${theme.primary} opacity-30`}></div>
      </BgAnimation>
      <BgAnimation className="bottom-40 left-20 w-72 h-72 rounded-full filter blur-[100px] bg-opacity-30" delay={2} duration={18}>
        <div className={`w-full h-full rounded-full bg-gradient-to-tl ${theme.secondary} opacity-20`}></div>
      </BgAnimation>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 relative z-10">
        <div className="flex flex-col justify-center">
          <div className="flex items-center mb-6">
            <img 
              src={product.logoUrl}
              alt={product.name} 
              className="h-10 w-auto mr-4" 
              onLoad={() => setImageLoaded(true)}
            />
            <span className={`text-sm uppercase tracking-wider ${theme.accent} font-semibold bg-zinc-800/70 px-4 py-1 rounded-full`}>
              {product.category}
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white leading-tight">
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>
              {product.tagline}
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">{product.description}</p>
          
          <ul className="mb-8 space-y-3">
            {product.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index} className="flex items-start">
                <span className={`inline-flex items-center justify-center flex-shrink-0 w-6 h-6 rounded-full ${theme.highlight} mr-3 mt-0.5`}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-200 text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button 
              onClick={() => onGetStarted(product.id)} 
              className={`bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white font-bold py-3 px-8 rounded-xl shadow-lg ${theme.glow} relative overflow-hidden group transition duration-300`}
            >
              <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></span>
              <span className="relative z-10 flex items-center justify-center">
                Get Started Free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
            
            <button 
              onClick={() => window.open(product.demoUrl, '_blank')}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl border border-white/20 transition duration-300"
            >
              Watch Demo
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="relative overflow-hidden h-[400px] rounded-xl">
          {/* Animated glowing background effect */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-10 blur-3xl`}
            style={{ animation: 'pulse 5s ease-in-out infinite' }}
          ></div>
          
          {/* Floating particles for premium effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div 
                key={i}
                className={`absolute rounded-full ${product.id === 'relevance-ai' ? 'bg-indigo-500' : 'bg-blue-500'} opacity-20`}
                style={{
                  width: Math.random() * 8 + 4 + 'px',
                  height: Math.random() * 8 + 4 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `floatParticle ${Math.random() * 10 + 15}s ease-in-out infinite`,
                  animationDelay: Math.random() * 5 + 's'
                }}
              />
            ))}
          </div>
          
          {/* Image carousel with fade transition */}
          <div className="relative w-full h-full">
            {images.map((image, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 rounded-lg overflow-hidden ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundSize: image.includes('.svg') ? 'contain' : 'cover',
                  backgroundPosition: 'center', 
                  backgroundRepeat: 'no-repeat',
                  backgroundImage: `url(${image})`
                }}
              >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
                <img 
                  src={image} 
                  alt={`${product.name} - Screenshot ${index + 1}`} 
                  className="w-full h-full object-contain object-center z-10 relative hover:scale-105 transition-transform duration-700"
                />
              </div>
            ))}
          </div>
          
          {/* Feature dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? `${theme.highlight} w-6` : 'bg-white/30'
                }`}
                aria-label={`View screenshot ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Features Section
const FeaturesSection = ({ features, productId }) => {
  const theme = productThemes[productId] || productThemes['relevance-ai'];
  
  return (
    <div className="mb-20 relative">
      {/* Background decorative elements */}
      <BgAnimation className="top-40 -left-20 w-96 h-96 rounded-full filter blur-[120px]" delay={1} duration={25}>
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${theme.primary} opacity-10`}></div>
      </BgAnimation>
      
      <div className="text-center mb-10 relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Powerful Features</h3>
        <p className={`text-lg ${theme.accent} max-w-2xl mx-auto`}>
          {productId === 'relevance-ai' 
            ? 'Everything you need to build, deploy, and manage your AI workforce'
            : 'All the tools you need to create and deploy AI chatbots for your business'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((feature, i) => {
          // Split feature into title and description
          const [title, description] = feature.split(' - ');
          
          return (
            <div 
              key={i} 
              className={`bg-zinc-800/50 border ${theme.border} p-6 rounded-xl transition-all duration-500 group hover:bg-zinc-800/80 hover:scale-[1.02] hover:shadow-lg ${theme.glow}`}
            >
              <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br ${theme.primary} opacity-80 group-hover:opacity-100 transition duration-300`}>
                {/* Different icons for each feature */}
                {i % 5 === 0 && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                {i % 5 === 1 && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {i % 5 === 2 && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {i % 5 === 3 && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                )}
                {i % 5 === 4 && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                )}
              </div>
              
              <h4 className={`text-lg font-semibold ${theme.accent} mb-2 group-hover:text-white transition-colors duration-300`}>
                {title}
              </h4>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Stats Section
const StatsSection = ({ stats, productId }) => {
  const theme = productThemes[productId] || productThemes['relevance-ai'];
  
  return (
    <div className="mb-20 relative">
      <div className={`bg-gradient-to-br from-zinc-900/80 to-zinc-900/90 p-8 rounded-2xl border ${theme.border} overflow-hidden relative`}>
        {/* Background decorative elements */}
        <BgAnimation className="top-10 right-20 w-64 h-64 rounded-full filter blur-[100px]" delay={3} duration={12}>
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${theme.primary} opacity-10`}></div>
        </BgAnimation>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {productId === 'relevance-ai' 
              ? "Work is happening, even when you're not" 
              : "Improve your business efficiency"}
          </h2>
          <p className="text-gray-400">
            {productId === 'relevance-ai' 
              ? 'Your AI workforce is ready to support your team around the clock' 
              : 'Custom AI chatbots automate support and enhance user experience'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {stats.map((stat, index) => (
            <div key={index} className="text-center bg-zinc-800/40 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/40">
              <div className="flex items-center justify-center text-3xl md:text-4xl font-bold">
                {stat.prefix && <span className={theme.accent}>{stat.prefix}</span>}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>
                  {stat.value}
                </span>
                {stat.suffix && <span className={theme.accent}>{stat.suffix}</span>}
              </div>
              <p className="text-gray-300 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Pricing Section
const PricingSection = ({ pricing, onGetStarted, productId }) => {
  const theme = productThemes[productId] || productThemes['relevance-ai'];
  
  return (
    <div className="mb-20 relative" id="pricing">
      {/* Background decorative elements */}
      <BgAnimation className="bottom-20 right-10 w-96 h-96 rounded-full filter blur-[120px]" delay={2} duration={18}>
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${theme.primary} opacity-10`}></div>
      </BgAnimation>
      
      <div className="text-center mb-10 relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">Simple, Transparent Pricing</h3>
        <p className={`text-lg ${theme.accent} max-w-2xl mx-auto`}>
          Choose a plan that works for you, with a generous free tier to get started
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {pricing.map((plan, i) => (
          <div 
            key={i} 
            className={`bg-gradient-to-br ${
              i === 1 
                ? `${theme.card} shadow-lg ${theme.glow}` 
                : 'from-zinc-800/50 to-zinc-900/50'
              } p-8 rounded-xl border ${i === 1 ? theme.border : 'border-zinc-700/50'} relative overflow-hidden group transition duration-500 hover:shadow-lg ${theme.glow}`}
          >
            {i === 1 && (
              <div className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${theme.primary} text-white text-xs font-semibold py-1.5 text-center`}>
                MOST POPULAR
              </div>
            )}
            
            <div className={`${i === 1 ? 'pt-4' : ''}`}>
              <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
              <div className="flex items-baseline mb-6">
                <span className={`text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>
                  {plan.price}
                </span>
                <span className="text-gray-400 ml-1">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start">
                    <span className={`inline-flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full ${theme.highlight} mr-3 mt-0.5`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={() => onGetStarted(productId)}
                className={`w-full text-center py-3 px-4 rounded-lg transition duration-300 ${
                  i === 1 
                    ? `bg-gradient-to-r ${theme.primary} text-white hover:opacity-90` 
                    : 'bg-zinc-700 text-gray-200 hover:bg-zinc-600'
                }`}
              >
                {plan.name.toLowerCase().includes('free') ? 'Start Free' : i === 1 ? 'Get Started' : 'Choose Plan'}
              </button>
            </div>
            
            {/* Subtle hover effect */}
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        ))}
      </div>
      
      <p className="text-center text-gray-400 mt-6">
        {productId === 'relevance-ai' 
          ? 'All plans include a 14-day free trial. No credit card required.' 
          : 'Free trial available for 7 days. Credit card required for trial.'}
      </p>
    </div>
  );
};

// Main ReadyToUsePage component 
const ReadyToUsePage = () => {
  // Affiliate products data
  const affiliateProducts = [
    {
      id: 'relevance-ai',
      name: 'Relevance AI',
      description: 'Build your AI Workforce: The home for AI teams that work for you',
      shortDescription: 'AI workforce automation',
      tagline: 'Build Your AI Workforce',
      logoUrl: '/assets/affiliate-images/relevance-ai.png',
      imageUrl: '/assets/affiliate-images/relevance-ai-workforce.jpg',
      dashboardUrl: '/assets/affiliate-images/relevance-ai-dashboard.png',
      category: 'AI Workforce Platform',
      affiliateUrl: 'https://relevanceai.com?via=360bi',
      demoUrl: 'https://www.youtube.com/watch?v=LJcSOlUaRqA',
      typewriterSentences: [
        "Create autonomous AI teams that work for you 24/7",
        "Scale your business without increasing headcount",
        "Automate repetitive tasks and workflows effortlessly",
        "Deploy custom AI agents in minutes with no code"
      ],
      benefits: [
        'Build and deploy your AI workforce in minutes, no code required',
        'Create custom AI tools that integrate with your existing tech stack',
        'Scale business operations without increasing headcount',
        'SOC 2 Type 2 certified with enterprise-grade security'
      ],
      features: [
        'AI Agents - Build and recruit AI agents to automate tasks and workflows',
        'AI Tools - Create custom AI tools that integrate with your tech stack',
        'Multi-Agent Systems - Develop collaborative AI teams to solve complex problems',
        'Comprehensive API - Integrate seamlessly into your existing systems',
        'No-Code Builder - Create and deploy AI agents with a user-friendly interface'
      ],
      useCases: [
        'Sales Teams - Automate lead nurturing and booking meetings 24/7',
        'Marketing Departments - Generate unique content and automate repetitive tasks',
        'Customer Support - Provide instant responses and handle routine inquiries',
        'IT Operations - Streamline processes and reduce manual tasks',
        'HR Departments - Automate candidate screening and onboarding workflows'
      ],
      pricing: [
        {name: 'Free', price: '$0', features: ['5,000 credits/month', 'Limited to 2 tools', 'Email support']},
        {name: 'Pro', price: '$19', features: ['10,000 credits/month', '1 user seat', 'Chat support']},
        {name: 'Team', price: '$199', features: ['100,000 credits/month', '10 user seats', 'Priority support']}
      ],
      testimonials: [
        {
          quote: "Relevance AI has transformed our approach to customer service. We've automated 70% of our routine inquiries, allowing our team to focus on complex issues.",
          author: "Sarah Johnson",
          company: "TechSolutions Inc."
        },
        {
          quote: "The AI Workforce has become an integral part of our sales process. It's like having a 24/7 team that never sleeps, always following up with leads exactly as instructed.",
          author: "Michael Chen",
          company: "GrowthMetrics"
        }
      ],
      stats: [
        { value: 70, label: "Tasks Automated", suffix: "%" },
        { value: 24, label: "Hours Active Daily", suffix: "/7" },
        { value: 50, label: "AI Agents Available", prefix: "+" }
      ]
    },
    {
      id: 'customgpt',
      name: 'CustomGPT.ai',
      description: 'Build powerful AI chatbots that deliver exceptional customer experiences using your own business content',
      shortDescription: 'AI-powered chatbots for your business',
      tagline: 'Transform Your Content Into Intelligent Chatbots',
      logoUrl: '/assets/affiliate-images/customgpt/customgpt-logo-new.png',
      imageUrl: '/assets/affiliate-images/customgpt/customgpt-opengraph.png',
      dashboardUrl: '/assets/affiliate-images/customgpt/customgpt-chatbot.webp',
      category: 'AI Chatbot Platform',
      affiliateUrl: 'https://customgpt.ai/?fpr=daniel58',
      demoUrl: 'https://customgpt.ai/?fpr=daniel58',
      typewriterSentences: [
        "Create AI chatbots that understand your business perfectly",
        "Reduce support costs by up to 80% with 24/7 automated service",
        "Deploy in minutes with our no-code solution",
        "Ensure accurate responses with anti-hallucination technology",
        "Enhance customer satisfaction with personalized interactions"
      ],
      benefits: [
        'Create AI chatbots that instantly understand your business documentation',
        'Reduce customer support costs by up to 80% with 24/7 automated service',
        'Deploy in minutes with our intuitive no-code platform',
        'Enterprise-grade security with SOC-2 Type 2 and GDPR compliance',
        'Seamless integration with your existing tools and workflows'
      ],
      features: [
        'Intuitive Builder - Create custom AI chatbots in minutes with no coding required',
        'Versatile Integration - Connect with 100+ data sources including Google Drive, Notion, and Shopify',
        'Advanced Content Processing - Support for 1,400+ document formats with text extraction from images',
        'AI Accuracy Engine - Proprietary anti-hallucination technology ensures factual, reliable responses',
        'Multilingual Capabilities - Support customers globally with 95+ language options',
        'Conversation Analytics - Gain insights from user interactions to continuously improve performance'
      ],
      useCases: [
        'Customer Support - Resolve inquiries 24/7 with automated responses, reducing ticket volume by 80%',
        'Employee Onboarding - Create interactive training experiences that scale with your organization',
        'Knowledge Management - Provide instant access to company information and documentation',
        'Sales Acceleration - Convert more leads with instant responses to prospect questions',
        'E-commerce - Enhance shopping experiences with product recommendations and support',
        'Financial Services - Offer secure, compliant customer assistance for banking and insurance'
      ],
      pricing: [
        {name: 'Free Trial', price: '$0', features: ['14-day full access', '1 advanced chatbot', 'Email support', '1,000 queries/month']},
        {name: 'Business', price: '$99', features: ['Unlimited chatbots', '10,000 items per chatbot', '5 team members', 'Priority support']},
        {name: 'Enterprise', price: '$499', features: ['Custom solutions', 'Unlimited data capacity', 'Dedicated account manager', 'Custom integrations']}
      ],
      testimonials: [
        {
          quote: "CustomGPT.ai transformed our support operations. Within the first month, our chatbot was handling 85% of inquiries automatically, saving us over $12,000 in support costs while improving customer satisfaction.",
          author: "Michael Rodriguez",
          company: "SaaS Solutions Inc."
        },
        {
          quote: "Implementation took less than a day, and the accuracy is remarkable. Our customers can't tell they're talking to an AI, and our team now focuses on high-value activities instead of answering the same questions repeatedly.",
          author: "Sarah Johnson",
          company: "Bright Financial"
        },
        {
          quote: "After trying three other AI chatbot solutions, CustomGPT.ai is the only one that could accurately understand our complex products and provide helpful responses. The ROI has been exceptional.",
          author: "Thomas Chen",
          company: "TechProspects Global"
        }
      ],
      stats: [
        { value: 85, label: "Average Ticket Reduction", suffix: "%" },
        { value: 150, label: "Available Integrations", suffix: "+" },
        { value: 24, label: "Chatbot Availability", suffix: "/7" }
      ]
    },
    {
      id: 'aistudios',
      name: 'AI Studios',
      description: 'Create lifelike AI avatars and videos for marketing, training, and customer engagement',
      shortDescription: 'Lifelike AI avatars and videos',
      tagline: 'Bring Your Content To Life With AI Videos',
      logoUrl: '/assets/affiliate-images/aistudios/aistudios-logo.png',
      imageUrl: '/assets/affiliate-images/aistudios/aistudios-deepbrain.png',
      dashboardUrl: '/assets/affiliate-images/aistudios/aistudios-humans.png',
      category: 'AI Video Platform',
      affiliateUrl: 'https://www.aistudios.com/?via=360bi',
      demoUrl: 'https://www.aistudios.com/?via=360bi',
      typewriterSentences: [
        "Create professional AI videos in minutes, not days",
        "Choose from 100+ lifelike AI avatars that speak 140+ languages",
        "Transform text into engaging video content instantly",
        "Reduce video production costs by up to 90%",
        "Scale your video content across channels and markets"
      ],
      benefits: [
        'Create professional AI videos without cameras, studios, or actors',
        'Save thousands on video production while creating more content',
        'Scale content creation across multiple languages and markets',
        'Update videos instantly without re-shooting when information changes',
        'Maintain consistent brand messaging across all video content'
      ],
      features: [
        'Lifelike AI Avatars - Choose from 100+ realistic AI presenters for your videos',
        'Multi-Language Support - Create videos in 140+ languages with native-sounding speech',
        'Text-to-Video Conversion - Simply paste your script to generate professional videos',
        'Custom Avatar Creation - Create your own AI avatar from photos or video clips',
        'Background Customization - Use custom backgrounds or choose from premium templates',
        'Advanced Editing Tools - Fine-tune expressions, gestures, and delivery for perfect results'
      ],
      useCases: [
        'Marketing Videos - Create product demos, explainers, and promotional content at scale',
        'Learning & Development - Produce training and educational videos in multiple languages',
        'Customer Support - Create how-to guides and FAQ videos to reduce support tickets',
        'Internal Communications - Deliver consistent company updates across global teams',
        'Social Media Content - Generate regular video content for all social platforms',
        'Multilingual Expansion - Localize video content for international markets instantly'
      ],
      pricing: [
        {name: 'Starter', price: '$39', features: ['50 minutes/month', '100+ AI avatars', 'HD quality video', 'Standard templates']},
        {name: 'Business', price: '$199', features: ['300 minutes/month', 'Priority rendering', 'Premium templates', 'API access']},
        {name: 'Enterprise', price: '$499', features: ['Custom solution', 'Dedicated account manager', 'Custom avatars', 'Advanced analytics']}
      ],
      testimonials: [
        {
          quote: "AI Studios has revolutionized our marketing. We now produce 10x more video content at a fraction of our previous budget, and the quality is absolutely professional.",
          author: "Jennifer Martinez",
          company: "Global Marketing Solutions"
        },
        {
          quote: "Our training videos used to take weeks to produce and cost thousands. With AI Studios, we create them in minutes and can instantly translate them for our global teams.",
          author: "Robert Williams",
          company: "Enterprise Learning Inc."
        },
        {
          quote: "The ROI is incredible. We've increased our video content by 500% while reducing production costs by 85%. Our engagement metrics have doubled since implementing AI Studios.",
          author: "Lisa Chang",
          company: "Digital Media Group"
        }
      ],
      stats: [
        { value: 90, label: "Production Cost Reduction", suffix: "%" },
        { value: 140, label: "Supported Languages", suffix: "+" },
        { value: 10, label: "Minutes to Create Video", prefix: "<" }
      ]
    },
    {
      id: 'rytr',
      name: 'Rytr',
      description: 'AI writing assistant that helps you create high-quality content in just seconds, at a fraction of the cost',
      shortDescription: 'AI-powered writing assistant',
      tagline: 'Write Better Content, Faster',
      logoUrl: '/assets/affiliate-images/rytr/rytr-logo.png',
      imageUrl: '/assets/affiliate-images/rytr/rytr-dashboard.png',
      dashboardUrl: '/assets/affiliate-images/rytr/rytr-interface.png',
      category: 'AI Writing Platform',
      affiliateUrl: 'https://rytr.me/?via=360bi',
      demoUrl: 'https://rytr.me/?via=360bi',
      typewriterSentences: [
        "Create high-quality content in seconds, not hours",
        "Generate copy for ads, emails, blogs, and more",
        "Optimize your content for better engagement and conversions",
        "Save thousands on content creation and copywriting",
        "Supports 40+ use cases and 30+ languages"
      ],
      benefits: [
        'Create engaging content in seconds with AI-powered assistance',
        'Save up to 90% on content creation and copywriting costs',
        'Boost productivity and focus on strategy instead of writing',
        'Eliminate writer\'s block with unlimited content generation',
        'Scale content production across platforms and languages'
      ],
      features: [
        'Smart Editor - Real-time suggestions, tone adjustments, and content variations',
        'Template Library - 40+ templates for blogs, emails, ads, product descriptions, and more',
        '30+ Languages - Generate and translate content to reach global audiences',
        'Plagiarism-Free Content - Original, fresh content for every generation',
        'SEO Optimization - Create content that ranks well on search engines',
        'Team Collaboration - Share templates and content with your team'
      ],
      useCases: [
        'Blog Content - Generate engaging blog posts, articles, and outlines',
        'Marketing Copy - Create compelling ads, emails, and social media content',
        'Product Descriptions - Craft persuasive product descriptions for e-commerce',
        'Social Media - Generate engagement-optimized posts for all platforms',
        'Email Marketing - Write click-worthy subject lines and email content',
        'Website Copy - Create landing pages, about us sections, and more'
      ],
      pricing: [
        {name: 'Free', price: '$0', features: ['10,000 characters/month', '40+ use cases', '30+ languages', 'Access to AI tools']},
        {name: 'Premium', price: '$29', features: ['Unlimited characters', 'Premium use cases', 'Priority support', 'Browser extension']},
        {name: 'Unlimited', price: '$290', features: ['Everything in Premium', 'Yearly billing', 'Save 17%', 'Dedicated account manager']}
      ],
      testimonials: [
        {
          quote: "Rytr has completely changed our content workflow. What used to take our team days now takes minutes, and the quality is consistently excellent.",
          author: "David Parker",
          company: "Content Marketing Agency"
        },
        {
          quote: "As a non-native English speaker, Rytr helps me create professional content without grammar issues. It's like having a professional writer and editor on your team.",
          author: "Maria Sanchez",
          company: "Global Ecommerce"
        },
        {
          quote: "We've cut our content production costs by 75% while increasing output by 300%. Rytr has been a game-changer for our marketing department.",
          author: "James Wilson",
          company: "SaaS Platform Inc."
        }
      ],
      stats: [
        { value: 90, label: "Time Saved on Content Creation", suffix: "%" },
        { value: 40, label: "Use Cases Supported", suffix: "+" },
        { value: 5, label: "Million+ Users Worldwide", prefix: "" }
      ]
    }
  ];

  // State for the active product ID
  const [activeProductId, setActiveProductId] = useState(affiliateProducts[0].id);
  
  // Get the current featured product based on the active ID
  const featuredProduct = affiliateProducts.find(p => p.id === activeProductId) || affiliateProducts[0];
  
  // Memoize the handleGetStarted function to prevent unnecessary re-renders
  const handleGetStarted = useCallback((productId) => {
    const product = affiliateProducts.find(p => p.id === productId) || affiliateProducts[0];
    window.open(product.affiliateUrl, '_blank');
  }, [affiliateProducts]);

  // Memoize the theme to prevent recalculations on every render
  const theme = useMemo(() => 
    productThemes[featuredProduct.id] || productThemes['relevance-ai'],
    [featuredProduct.id]
  );
  
  return (
    <div className="relative overflow-hidden">
      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: animationKeyframes }} />
      
      {/* Animated Particles Background */}
      <BackgroundParticles count={40} productId={featuredProduct.id} />
      
      {/* Background decorative elements */}
      <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full filter blur-3xl opacity-70">
        <div className={`animate-blob w-full h-full rounded-full bg-gradient-to-br ${theme.primary} opacity-10`}></div>
      </div>
      <div className="absolute top-40 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-70">
        <div className={`animate-blob animation-delay-2000 w-full h-full rounded-full bg-gradient-to-br ${theme.secondary} opacity-10`}></div>
      </div>
      <div className="absolute -bottom-32 left-1/3 w-64 h-64 rounded-full filter blur-3xl opacity-70">
        <div className={`animate-blob animation-delay-4000 w-full h-full rounded-full bg-gradient-to-br ${theme.primary} opacity-10`}></div>
      </div>
      
      {/* Premium shimmer effect background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${
              featuredProduct.id === 'relevance-ai' ? 'rgba(129, 140, 248, 0.3)' : 
              featuredProduct.id === 'customgpt' ? 'rgba(96, 165, 250, 0.3)' : 
              featuredProduct.id === 'aistudios' ? 'rgba(16, 185, 129, 0.3)' :
              'rgba(249, 115, 22, 0.3)'
            }, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 8s linear infinite'
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Ready-to-Use</span> <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.primary}`}>
              AI Solutions
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Curated, production-ready AI tools that will transform your workflow today. 
            No setup hassle, just immediate value.
          </p>
          {/* Quick product navigation dots */}
          <div className="flex justify-center gap-2 mb-4">
            {affiliateProducts.map(product => (
              <button
                key={product.id}
                onClick={() => setActiveProductId(product.id)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeProductId === product.id 
                    ? `bg-${
                        product.id === 'relevance-ai' ? 'indigo' : 
                        product.id === 'customgpt' ? 'blue' : 
                        product.id === 'aistudios' ? 'emerald' :
                        'orange'
                      }-500 w-6` 
                    : 'bg-white/30'
                }`}
                aria-label={`Select ${product.name}`}
              />
            ))}
          </div>
        </div>
        
        {/* Product Selector */}
        {affiliateProducts.length > 1 && (
          <SolutionSelector 
            products={affiliateProducts} 
            activeProductId={activeProductId} 
            onSelectProduct={setActiveProductId} 
          />
        )}
        
        {/* Product Detail */}
        <ProductDetail 
          product={featuredProduct} 
          onGetStarted={handleGetStarted} 
        />
        
        {/* Stats Section */}
        <StatsSection 
          stats={featuredProduct.stats}
          productId={featuredProduct.id}
        />
        
        {/* Features Section */}
        <FeaturesSection 
          features={featuredProduct.features}
          productId={featuredProduct.id}
        />
        
        {/* Pricing Section */}
        <PricingSection 
          pricing={featuredProduct.pricing} 
          onGetStarted={handleGetStarted}
          productId={featuredProduct.id}
        />
        
        {/* Call to Action */}
        <div className={`bg-gradient-to-br ${theme.backgroundStart} ${theme.backgroundEnd} p-10 rounded-2xl text-center border ${theme.border} relative overflow-hidden`}>
          {/* Background glow effect */}
          <BgAnimation className="-top-40 left-1/2 transform -translate-x-1/2 w-[120%] h-[200%] rounded-full" delay={0} duration={30}>
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${theme.primary} opacity-5 blur-3xl`}></div>
          </BgAnimation>
          
          {/* Premium animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <div 
                key={i}
                className={`absolute rounded-full ${
                  featuredProduct.id === 'relevance-ai' ? 'bg-indigo-500' : 
                  featuredProduct.id === 'customgpt' ? 'bg-blue-500' : 
                  featuredProduct.id === 'aistudios' ? 'bg-emerald-500' :
                  'bg-orange-500'
                } opacity-20`}
                style={{
                  width: Math.random() * 6 + 2 + 'px',
                  height: Math.random() * 6 + 2 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite`,
                  animationDelay: Math.random() * 5 + 's'
                }}
              />
            ))}
          </div>
          
          {/* Premium shimmer effect */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(90deg, transparent, ${
                  featuredProduct.id === 'relevance-ai' ? 'rgba(129, 140, 248, 0.3)' : 
                  featuredProduct.id === 'customgpt' ? 'rgba(96, 165, 250, 0.3)' : 
                  featuredProduct.id === 'aistudios' ? 'rgba(16, 185, 129, 0.3)' :
                  'rgba(249, 115, 22, 0.3)'
                }, transparent)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 8s linear infinite'
              }}
            />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of businesses using {featuredProduct.name} to automate tasks and increase productivity.
            </p>
            <button 
              onClick={() => handleGetStarted(featuredProduct.id)}
              className={`bg-gradient-to-r ${theme.primary} hover:opacity-90 text-white font-bold py-4 px-10 rounded-xl shadow-lg ${theme.glow} relative overflow-hidden group transition duration-300`}
            >
              <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
              <span className="relative z-10 flex items-center justify-center text-lg">
                Try {featuredProduct.name} For Free
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </button>
            <p className="text-gray-400 mt-4">
              {featuredProduct.id === 'relevance-ai' 
                ? 'No credit card required. Start building your AI workforce today.' 
                : featuredProduct.id === 'customgpt'
                ? 'Free 14-day trial available. Start creating your custom chatbot now.'
                : featuredProduct.id === 'aistudios'
                ? 'Free trial available. Create your first AI video in minutes.'
                : 'Free plan available. Start writing better content today.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadyToUsePage;
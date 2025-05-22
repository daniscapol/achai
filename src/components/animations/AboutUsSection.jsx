import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AboutUsSection - Animated section describing AchaAI's mission and vision
 * Performance optimized for smooth scrolling
 */
const AboutUsSection = ({ onExploreCategories }) => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  // Set visibility after a short delay to improve initial render performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Use simpler, more performant animations when visible
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        staggerChildren: prefersReducedMotion ? 0 : 0.1 
      }
    }
  };

  const missionPoints = [
    {
      title: "Free Content",
      description: "Providing high-quality AI resources, tutorials, and news accessible to everyone.",
      icon: "📚",
      gradient: "from-purple-600 to-indigo-600"
    },
    {
      title: "Open Source",
      description: "Distributing valuable open source projects that advance AI capabilities.",
      icon: "🔓",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      title: "AI Democratization",
      description: "Making AI technology accessible and usable for people of all skill levels.",
      icon: "🌍",
      gradient: "from-emerald-600 to-green-600"
    },
    {
      title: "Partnership Network",
      description: "Collaborating with leading technology partners to support innovative AI projects.",
      icon: "🤝",
      gradient: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden will-change-transform">
      {/* Background effects - simplified and optimized */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient - static for better performance */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-900/90"></div>
        
        {/* Static background elements instead of animated ones */}
        <div 
          className="absolute right-0 top-1/4 w-[35vw] h-[35vw] rounded-full bg-gradient-radial from-purple-600/10 to-transparent blur-3xl opacity-30"
        />
        
        <div 
          className="absolute left-0 bottom-1/4 w-[30vw] h-[30vw] rounded-full bg-gradient-radial from-indigo-600/10 to-transparent blur-3xl opacity-20"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeInUpVariants}
        >
          <motion.span 
            className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3"
            variants={fadeInUpVariants}
          >
            About Us
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUpVariants}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              The Biggest AI Hub in the World
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-zinc-400 max-w-3xl mx-auto"
            variants={fadeInUpVariants}
          >
            AchAI is your go-to destination for AI news, tutorials, materials, and projects.
          </motion.p>
        </motion.div>
        
        {/* Enhanced Mission Statement */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            className="relative p-8 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/20 backdrop-blur-md shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-600/20 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-600/20 to-transparent rounded-full blur-xl"></div>
            
            {/* Mission icon and title */}
            <div className="relative z-10 flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-300">
                  Our Mission
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
                  <span className="text-purple-400 text-sm">Democratizing AI</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced mission text with highlights */}
            <div className="relative z-10 space-y-4">
              <p className="text-lg text-zinc-300 leading-relaxed">
                At <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 font-semibold">AchAI</span>, we're committed to 
                <span className="text-white font-medium"> democratizing AI technology</span> and making it accessible to everyone.
              </p>
              
              <p className="text-lg text-zinc-300 leading-relaxed">
                We believe in the <span className="text-emerald-400 font-medium">transformative power</span> of artificial intelligence 
                and its potential to <span className="text-amber-400 font-medium">solve real-world problems</span>.
              </p>
              
              <p className="text-lg text-zinc-300 leading-relaxed">
                Our platform connects you with the <span className="text-blue-400 font-medium">best AI solutions</span>, tutorials, and 
                resources to help you harness this power, <span className="text-purple-400 font-medium">regardless of your technical expertise</span>.
              </p>
            </div>
            
            {/* Key stats or highlights */}
            <div className="relative z-10 mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-purple-400 mb-1">∞</div>
                <div className="text-sm text-zinc-400">Unlimited Access</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-emerald-400 mb-1">🌍</div>
                <div className="text-sm text-zinc-400">Global Community</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-2xl font-bold text-amber-400 mb-1">🚀</div>
                <div className="text-sm text-zinc-400">Innovation First</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Mission Points Grid - with simpler animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {missionPoints.map((point, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : index * 0.05 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${point.gradient} flex-shrink-0`}>
                  <span className="text-white text-xl">{point.icon}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2 text-white">{point.title}</h4>
                  <p className="text-zinc-400">{point.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Final CTA - Simplified animation */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            Join Our Community
          </h3>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto mb-8">
            Become part of the growing AchAI community and stay at the forefront of AI innovation.
            Together, we're building the future of artificial intelligence.
          </p>
          
          <div className="inline-flex p-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
            <a 
              href="/about" 
              className="px-6 py-3 rounded-md bg-slate-950 text-white font-medium hover:bg-slate-900/80 transition-colors duration-300"
            >
              Learn About AchAI
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUsSection;
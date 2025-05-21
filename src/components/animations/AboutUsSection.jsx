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
        
        {/* Mission Statement - prerender for better performance */}
        <div className="max-w-4xl mx-auto mb-16">
          <motion.div
            className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-300">
              Our Mission
            </h3>
            <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
              At AchAI, we're committed to democratizing AI technology and making it accessible to everyone.
              We believe in the transformative power of artificial intelligence and its potential to solve 
              real-world problems. Our platform connects you with the best AI solutions, tutorials, and 
              resources to help you harness this power, regardless of your technical expertise.
            </p>
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
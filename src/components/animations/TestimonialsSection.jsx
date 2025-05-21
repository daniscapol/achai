import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * TestimonialsSection - A premium section for displaying user testimonials
 * Matching the style of other sections on the homepage
 */
const TestimonialsSection = ({ className = "" }) => {
  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "AI Research Lead",
      company: "TechCorp",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      quote: "AchaAI has revolutionized our workflow. The solutions we've integrated have increased our productivity by 300% and allowed us to build more sophisticated AI systems faster than ever before.",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "CTO",
      company: "DataFlow Systems",
      image: "https://randomuser.me/api/portraits/men/54.jpg",
      quote: "I was skeptical at first, but after implementing several AchaAI solutions, our team's productivity skyrocketed. The integration with Claude is seamless and has transformed how we approach AI development.",
      rating: 5
    },
    {
      id: 3,
      name: "Jessica Williams",
      role: "Product Manager",
      company: "InnovateAI",
      image: "https://randomuser.me/api/portraits/women/45.jpg",
      quote: "The documentation and tutorials made implementation incredibly straightforward. Our team was able to get up and running in minutes, not days. The MCP solutions have become an essential part of our tech stack.",
      rating: 4
    },
    {
      id: 4,
      name: "Thomas Rodriguez",
      role: "Lead Developer",
      company: "FutureTech",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      quote: "As someone who works with AI systems daily, I can confidently say that AchaAI solutions have set a new standard. The quality, reliability, and performance have exceeded our expectations at every turn.",
      rating: 5
    }
  ];
  
  // Active testimonial tracking
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Calculate next and previous indices
  const nextIndex = (activeIndex + 1) % testimonials.length;
  const prevIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
  
  // Navigate to next testimonial
  const goToNext = () => {
    setActiveIndex(nextIndex);
  };
  
  // Navigate to previous testimonial
  const goToPrev = () => {
    setActiveIndex(prevIndex);
  };
  
  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-400'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };
  
  return (
    <section className={`relative py-32 overflow-hidden ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-900/90"></div>
        
        {/* Static background elements for better performance */}
        <div 
          className="absolute top-0 left-0 w-[40vw] h-[40vw] rounded-full bg-gradient-radial from-purple-600/5 to-transparent blur-3xl opacity-30"
        />
        
        <div 
          className="absolute bottom-0 right-0 w-[35vw] h-[35vw] rounded-full bg-gradient-radial from-indigo-600/5 to-transparent blur-3xl opacity-20"
        />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
            Client Success
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              What Our Users Say
            </span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Discover how AchaAI solutions have transformed workflows and enabled breakthrough innovation for teams worldwide.
          </p>
        </motion.div>
        
        {/* Testimonials carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Main testimonial */}
            <motion.div
              key={testimonials[activeIndex].id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-8 shadow-xl"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full blur opacity-50"></div>
                    <div className="relative overflow-hidden rounded-full w-20 h-20 border-2 border-white/10">
                      <img 
                        src={testimonials[activeIndex].image} 
                        alt={testimonials[activeIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {testimonials[activeIndex].name}
                      </h3>
                      <p className="text-purple-300">
                        {testimonials[activeIndex].role}, {testimonials[activeIndex].company}
                      </p>
                    </div>
                    <div className="flex">
                      {renderStars(testimonials[activeIndex].rating)}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <svg className="w-8 h-8 text-purple-500/40 mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-zinc-200 text-lg italic">
                      {testimonials[activeIndex].quote}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Navigation buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between items-center px-4 left-0">
              <motion.button
                onClick={goToPrev}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              
              <motion.button
                onClick={goToNext}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 w-8'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          
          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-zinc-300 mb-6">
              Join hundreds of teams already using AchaAI solutions
            </p>
            <motion.a
              href="#/search"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold relative overflow-hidden inline-block group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Simplified shine effect - CSS only for better performance */}
              <div 
                className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[45deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000"
              />
              <span className="relative z-10">Explore Solutions</span>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
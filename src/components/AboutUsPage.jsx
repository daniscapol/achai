import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * AboutUsPage - A comprehensive page about AchAI's mission, vision, and values
 * Follows modern tech company best practices for About Us pages
 */
const AboutUsPage = ({ onNavigateToCategories }) => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Core values data
  const coreValues = [
    {
      title: "Free Content",
      description: "Providing high-quality AI resources, tutorials, and news accessible to everyone.",
      icon: "📚",
      gradient: "from-purple-600 to-indigo-600",
      buttonText: "Explore Resources",
      buttonLink: "#/search?type=server"
    },
    {
      title: "Open Source",
      description: "Distributing valuable open source projects that advance AI capabilities.",
      icon: "🔓",
      gradient: "from-blue-600 to-cyan-600",
      buttonText: "View Projects",
      buttonLink: "#/search?category=open-source"
    },
    {
      title: "AI Democratization",
      description: "Making AI technology accessible and usable for people of all skill levels.",
      icon: "🌍",
      gradient: "from-emerald-600 to-green-600",
      buttonText: "Learn How",
      buttonLink: "#/tutorials"
    },
    {
      title: "Partnership Network",
      description: "Collaborating with leading technology partners to support innovative AI projects.",
      icon: "🤝",
      gradient: "from-amber-500 to-orange-600",
      buttonText: "Meet Partners",
      buttonLink: "#/categories"
    }
  ];

  // Team members data
  const teamMembers = [
    {
      name: "Dan",
      title: "Co-Founder & CEO",
      image: "/assets/news-images/fallback.jpg",
      bio: "Dan leads AchaAI with a vision to democratize artificial intelligence and make it accessible to everyone."
    },
    {
      name: "Fab",
      title: "Co-Founder & CTO",
      image: "/assets/news-images/fallback.jpg",
      bio: "Fab brings deep technical expertise in AI systems and leads our technology initiatives."
    }
  ];

  // Timeline events
  const timelineEvents = [
    {
      year: "2024",
      title: "AI Hub Establishment",
      description: "Became the world's largest AI hub with millions of users accessing our resources monthly 🚀"
    },
    {
      year: "2025",
      title: "AI Innovation Center",
      description: "Launching the AchaAI Innovation Center, connecting developers with cutting-edge AI technologies 🔮"
    }
  ];

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Hero section with parallax effect */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden flex items-center">
        {/* Background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-purple-900/20 to-slate-900"></div>
          
          {/* Background shapes and animated elements */}
          <div className="absolute right-0 top-1/4 w-[40vw] h-[40vw] rounded-full bg-gradient-radial from-purple-600/10 to-transparent blur-3xl animate-pulse-slow"></div>
          <div className="absolute left-0 bottom-1/4 w-[30vw] h-[30vw] rounded-full bg-gradient-radial from-indigo-600/10 to-transparent blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
          
          {/* Floating tech symbols */}
          <div className="absolute top-[15%] left-[10%] text-4xl opacity-20 animate-float-slow">🧠</div>
          <div className="absolute top-[30%] right-[15%] text-4xl opacity-20 animate-float-slow" style={{animationDelay: '1.5s'}}>🤖</div>
          <div className="absolute bottom-[20%] left-[25%] text-4xl opacity-20 animate-float-slow" style={{animationDelay: '3s'}}>💻</div>
          <div className="absolute bottom-[35%] right-[20%] text-4xl opacity-20 animate-float-slow" style={{animationDelay: '4.2s'}}>🔮</div>
          
          {/* Abstract tech lines */}
          <div className="absolute inset-0 bg-[url('/assets/news-images/fallback.jpg')] bg-cover bg-center opacity-[0.03] mix-blend-screen"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        {/* Hero content */}
        <div className="container mx-auto px-6 z-10 relative">
          <motion.div 
            className="max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="flex flex-col items-center mb-8">
              <img src="/assets/logo.png" alt="AchAI Logo" className="h-24 w-auto mb-6" />
            </div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-4">
              Our Story
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                The Biggest AI Hub in the World
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl">
              AchAI is your go-to destination for AI news, tutorials, materials, and projects.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Mission section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
              Our Mission
            </span>
            <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-300">
              Democratizing AI for Everyone
            </h2>
            
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-sm rounded-2xl p-8">
              <p className="text-xl text-zinc-300 mb-6 leading-relaxed">
                At AchAI, we're committed to democratizing AI technology and making it accessible to everyone. 
                We believe in the transformative power of artificial intelligence and its potential to solve 
                real-world problems.
              </p>
              <p className="text-xl text-zinc-300 leading-relaxed">
                Our platform connects you with the best AI solutions, tutorials, and resources to help you 
                harness this power, regardless of your technical expertise. We're building a future where 
                AI is a tool that empowers everyone, not just those with specialized knowledge.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Vision statement with full-width image */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-purple-900/30 z-0"></div>
        <div className="absolute inset-0 opacity-20 z-0 bg-[url('/assets/news-images/llama3.jpg')] bg-cover bg-center"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
            <p className="text-2xl text-zinc-200 mb-4 leading-relaxed">
              "We envision a world where artificial intelligence is accessible to everyone, 
              empowering individuals and organizations to solve complex problems and unlock 
              new possibilities."
            </p>
            <p className="text-zinc-400 italic">— AchAI Founding Team</p>
          </motion.div>
        </div>
      </section>
      
      {/* Core values section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
              Our Values
            </span>
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              What Drives Us
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              These core principles guide our decisions and shape our platform.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-colors duration-300"
                variants={fadeIn}
              >
                <div className={`h-2 w-full bg-gradient-to-r ${value.gradient}`}></div>
                <div className="p-8">
                  <div className="flex items-start gap-5 mb-6">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br ${value.gradient} flex-shrink-0`}>
                      <span className="text-white text-2xl">{value.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-white">{value.title}</h3>
                      <p className="text-zinc-400">{value.description}</p>
                    </div>
                  </div>
                  
                  <a 
                    href={value.buttonLink}
                    className="inline-flex items-center text-indigo-300 hover:text-indigo-200 transition-colors"
                  >
                    <span className="mr-2">{value.buttonText}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Timeline section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
              Our Journey
            </span>
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              The AchAI Story
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              From inception to today, our mission to democratize AI has guided our growth.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto relative">
            {/* Vertical timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-600/50 to-indigo-600/50"></div>
            
            {/* Timeline events */}
            <motion.div 
              className="relative z-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {timelineEvents.map((event, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-center mb-16 last:mb-0 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                  variants={fadeIn}
                >
                  {/* Year bubble */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center z-20">
                    <span className="text-white text-sm font-bold">{event.year}</span>
                  </div>
                  
                  {/* Event content */}
                  <div className={`w-5/12 p-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl ${index % 2 === 0 ? 'text-right mr-8' : 'ml-8'}`}>
                    <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
                    <p className="text-zinc-400">{event.description}</p>
                  </div>
                  
                  {/* Empty space on the other side */}
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Team section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
              Our Founders
            </span>
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Meet Dan & Fab
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              The visionaries behind AchAI, working to make AI accessible to everyone.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-colors duration-300"
                variants={fadeIn}
              >
                <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-indigo-900/30 to-purple-900/30 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border-2 border-white/10">
                    <span className="text-6xl">{index === 0 ? '👨‍💻' : '🧠'}</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-indigo-300 mb-4 inline-block px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/20 text-sm">{member.title}</p>
                  <p className="text-zinc-300 mt-4 leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Community section */}
      <section className="py-24 relative bg-gradient-to-b from-slate-900/90 via-purple-900/20 to-slate-900/90 overflow-hidden">
        {/* Floating community emojis */}
        <div className="absolute top-[10%] left-[5%] text-5xl opacity-25 animate-float-slow">👥</div>
        <div className="absolute top-[15%] right-[8%] text-5xl opacity-25 animate-float-slow" style={{animationDelay: '1.2s'}}>🌐</div>
        <div className="absolute bottom-[15%] left-[12%] text-5xl opacity-25 animate-float-slow" style={{animationDelay: '2.5s'}}>💡</div>
        <div className="absolute bottom-[20%] right-[10%] text-5xl opacity-25 animate-float-slow" style={{animationDelay: '3.7s'}}>🚀</div>
        
        {/* Animated gradient orbs */}
        <div className="absolute right-1/4 top-1/4 w-[20vw] h-[20vw] rounded-full bg-gradient-radial from-purple-600/10 to-transparent blur-3xl animate-pulse-slow"></div>
        <div className="absolute left-1/4 bottom-1/4 w-[25vw] h-[25vw] rounded-full bg-gradient-radial from-indigo-600/10 to-transparent blur-3xl animate-pulse-slow" style={{animationDelay: '2.2s'}}></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-purple-500/20 text-indigo-300 text-sm font-medium mb-3">
              Join Us
            </span>
            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Be Part of the AchAI Community
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-8">
              Join thousands of AI enthusiasts, developers, and businesses already using AchAI solutions.
            </p>
            
            <div className="inline-flex p-0.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
              <button 
                onClick={onNavigateToCategories} 
                className="px-8 py-4 rounded-md bg-slate-950 text-white font-bold text-lg hover:bg-slate-900/80 transition-colors duration-300"
              >
                Explore Our Solutions
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
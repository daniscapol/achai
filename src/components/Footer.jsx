import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  // Easter egg state and handler
  const [easterEggActive, setEasterEggActive] = React.useState(false);
  const [currentEasterEgg, setCurrentEasterEgg] = React.useState(0);
  
  const easterEggGifs = [
    "/assets/easter-eggs/raon_idle.gif",
    "/assets/easter-eggs/secret_animation.gif"
  ];

  const activateEasterEgg = () => {
    setCurrentEasterEgg(Math.floor(Math.random() * easterEggGifs.length));
    setEasterEggActive(true);
    setTimeout(() => setEasterEggActive(false), 5000); // Hide after 5 seconds
  };
  return (
    <footer className="text-gray-400 mt-10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-zinc-900"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-1/2 h-1 rounded-b-full bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 blur-sm"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-indigo-900/10 rounded-full blur-3xl"></div>
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      
      <div className="container mx-auto p-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-6 group">
              <img src="/assets/logo.png" alt="AchAI Logo" className="h-16 w-auto mr-4 group-hover:scale-105 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">
                  AchAI
                </span>
                <span className="text-gray-500 text-xs">{t('footer.tagline', 'AI Solutions Marketplace')}</span>
              </div>
            </div>
            <p className="text-sm mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-3 mb-6">
              {/* Instagram social media link */}
              <a 
                href="https://www.instagram.com/achaihub/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-purple-600/20 hover:border-purple-500/50 border border-zinc-700 transition-colors duration-300 group"
                aria-label="Follow us on Instagram"
              >
                <svg 
                  className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 md:col-span-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                {t('footer.resources')}
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { label: t('footer.categories'), href: '#/browse-categories' },
                  { label: t('navigation.ready_to_use'), href: '#/ready-to-use' },
                  { label: t('common.agents', 'AI Agents'), href: '#/ai-agents' },
                ].map((item) => (
                  <li key={item.label}>
                    <a 
                      href={item.href} 
                      className="hover:text-purple-400 transition-colors duration-300 flex items-center group"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3.5 w-3.5 mr-2 text-purple-500/50 group-hover:text-purple-400 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                {t('footer.guides', 'Guides')}
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { label: t('footer.product_comparison', 'Product Comparison'), href: '#/compare' },
                  { label: t('navigation.connect_to_claude'), href: '#/connect-to-claude' },
                  { label: t('common.premium') + ' ' + t('common.features'), href: '#/premium' },
                ].map((item) => (
                  <li key={item.label}>
                    <a 
                      href={item.href} 
                      className="hover:text-indigo-400 transition-colors duration-300 flex items-center group"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3.5 w-3.5 mr-2 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                {t('footer.community')}
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  { label: t('navigation.submit_server'), href: '#/submit' },
                  { label: t('navigation.about_us'), href: '#/about-us' },
                  { label: t('footer.contact'), href: '#/contact' },
                  { label: t('footer.affiliate_program', 'Affiliate Program'), href: '#/affiliate' },
                  { label: t('footer.developer_api', 'Developer API'), href: '#/api', badge: t('common.new') }
                ].map((item) => (
                  <li key={item.label}>
                    <a 
                      href={item.href} 
                      className="hover:text-blue-400 transition-colors duration-300 flex items-center group"
                      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3.5 w-3.5 mr-2 text-blue-500/50 group-hover:text-blue-400 transition-colors" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{item.label}</span>
                      {item.external && (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 ml-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        
        {/* Bottom footer */}
        <div className="mt-12 pt-8 border-t border-zinc-700/50 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mb-4 md:mb-0">
            <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
            <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">{t('footer.privacy_policy')}</a>
            <a href="#" className="text-gray-500 hover:text-purple-400 transition-colors">{t('footer.terms_of_service')}</a>
            {/* Instagram Link */}
            <a 
              href="https://www.instagram.com/achaihub/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
            >
              <svg 
                className="w-4 h-4" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </div>
          <div className="text-gray-500 text-xs relative">
            <span>{t('footer.built_with').split('❤️')[0]}</span>
            <span className="text-red-400 mx-1 cursor-pointer" onClick={activateEasterEgg}>♥</span>
            <span>{t('footer.built_with').split('❤️')[1] || 'by the AchAI team'}</span>
            
            {/* Hidden Easter Egg */}
            {easterEggActive && (
              <div className="absolute -top-[300px] -right-[200px] w-[200px] h-[200px] z-50 transform scale-0 animate-scale-up pointer-events-none">
                <img 
                  src={easterEggGifs[currentEasterEgg]} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            {/* More visible but still discreet admin link */}
            <div className="absolute -bottom-6 right-0 mt-2">
              <a href="/secure-admin" className="text-gray-500 hover:text-purple-400 text-xs transition-colors">
                {t('footer.admin_access', 'Admin Access')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  // Easter egg state and handler
  const [easterEggActive, setEasterEggActive] = React.useState(false);
  const activateEasterEgg = () => {
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
              {/* Social media icons - placeholders for now */}
              {['github', 'twitter', 'discord'].map((platform) => (
                <a 
                  key={platform} 
                  href="#" 
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-800 hover:bg-purple-600/20 hover:border-purple-500/50 border border-zinc-700 transition-colors duration-300 group"
                  aria-label={`Follow us on ${platform}`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    {platform === 'github' && (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.164 22 16.417 22 12c0-5.523-4.477-10-10-10z"
                      />
                    )}
                    {platform === 'twitter' && (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"
                      />
                    )}
                    {platform === 'discord' && (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M14 12.775C14 13.107 13.679 13.393 13.293 13.393 12.892 13.393 12.571 13.107 12.571 12.775 12.571 12.464 12.892 12.179 13.293 12.179 13.679 12.179 14 12.464 14 12.775zM10.571 12.775C10.571 13.107 10.25 13.393 9.864 13.393 9.463 13.393 9.143 13.107 9.143 12.775 9.143 12.464 9.463 12.179 9.864 12.179 10.25 12.179 10.571 12.464 10.571 12.775zM8.286 12.179H9.143V13.393H8.286zM12.571 12.179H13.429V13.393H12.571z M17.8 15.214C17.661 16.393 16.857 18.679 14.686 18.679L14.686 16.857C15.643 16.857 16.179 15.643 16.179 15.214H17.8zM19.857 8.214V18.429C19.857 18.786 19.232 19.071 18.714 19.071H15.143L14.571 20H10.5L9.929 19.071H6.429C5.911 19.071 5.143 18.786 5.143 18.429V8.214C5.143 7.857 5.911 7.571 6.429 7.571H18.714C19.232 7.571 19.857 7.857 19.857 8.214z"
                      />
                    )}
                  </svg>
                </a>
              ))}
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
          </div>
          <div className="text-gray-500 text-xs relative">
            <span>{t('footer.built_with').split('❤️')[0]}</span>
            <span className="text-red-400 mx-1 cursor-pointer" onClick={activateEasterEgg}>♥</span>
            <span>{t('footer.built_with').split('❤️')[1] || 'by the AchAI team'}</span>
            
            {/* Hidden Easter Egg */}
            {easterEggActive && (
              <div className="absolute -top-[300px] -right-[200px] w-[200px] h-[200px] z-50 transform scale-0 animate-scale-up pointer-events-none">
                <img 
                  src="/assets/easter-eggs/raon_idle.gif" 
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

import React from 'react';
import { useTranslation } from 'react-i18next';

const ConnectToClaudePage = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="max-w-2xl">
        {/* Imagem representativa - idealmente, salvaríamos a imagem original ou usaríamos uma similar */}
        <img src="/assets/claude_connect_illustration.png" alt={t('connect_claude.hero.image_alt')} className="w-64 h-auto mx-auto mb-8 rounded-lg shadow-xl" />

        <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
          {t('connect_claude.hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          {t('connect_claude.hero.description')}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold text-purple-400 mb-2">{t('connect_claude.features.integrations.title')}</h3>
            <p className="text-gray-400">{t('connect_claude.features.integrations.description')}</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold text-purple-400 mb-2">{t('connect_claude.features.automation.title')}</h3>
            <p className="text-gray-400">{t('connect_claude.features.automation.description')}</p>
          </div>
        </div>

        <button 
          onClick={() => alert(t('connect_claude.waitlist.alert'))} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-150 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {t('connect_claude.waitlist.button')}
        </button>

        <div className="mt-12 text-gray-400">
            <h4 className="text-xl font-semibold text-gray-200 mb-3">{t('connect_claude.faq.supported_tools.question')}</h4>
            <p>{t('connect_claude.faq.supported_tools.answer')}</p>
        </div>

      </div>
    </div>
  );
};

export default ConnectToClaudePage;


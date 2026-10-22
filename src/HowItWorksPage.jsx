import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang) setLanguage(savedLang);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'English' ? 'Tamil' : 'English';
      localStorage.setItem('appLanguage', newLang);
      return newLang;
    });
  };

  const t = {
    English: {
      title: 'How It Works',
      back: '← Back to Home',
      step1: 'Book',
      step1d: 'Choose your yarn type, select size & enter your address details.',
      step2: 'We Match',
      step2d: 'We find the best skilled worker near your location instantly.',
      step3: 'Service',
      step3d: 'Worker completes the warp joining service at your location.',
      step4: 'Done',
      step4d: 'Confirm the service completion & rate your worker experience.',
      appTitle: 'WARP JOINING',
      languageLabel: 'English / தமிழ்',
    },
    Tamil: {
      title: 'எப்படி வேலை செய்கிறது',
      back: '← முகப்பு',
      step1: 'பதிவு செய்க',
      step1d: 'உங்கள் நூல் வகை, அளவு & முகவரி விவரங்களை உள்ளிடவும்.',
      step2: 'நாங்கள் பொருத்துகிறோம்',
      step2d: 'உங்கள் இருப்பிடத்திற்கு அருகில் உள்ள சிறந்த தொழிலாளியைக் காண்போம்.',
      step3: 'சேவை',
      step3d: 'தொழிலாளி உங்கள் இருப்பிடத்தில் பாவு இணைத்தலை முடிக்கிறார்.',
      step4: 'முடிந்தது',
      step4d: 'சேவையை உறுதிப்படுத்தி உங்கள் அனுபவத்தை மதிப்பீடு செய்யவும்.',
      appTitle: 'பாவு இணைத்தல்',
      languageLabel: 'தமிழ் / English',
    }
  };

  const lang = t[language];

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-[#0B3B2C] text-white shadow-lg py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl">🧵</span>
            <h1 className="text-xl font-bold">{lang.appTitle}</h1>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition text-sm border border-white/20">
              <span className="text-lg">🌐</span>
              <span className="font-medium text-sm">{lang.languageLabel}</span>
            </button>
            <button onClick={() => navigate('/')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition">
              {lang.back}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 flex-1">
        <h2 className="text-4xl font-extrabold text-[#0B3B2C] mb-12 text-center">{lang.title}</h2>
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex items-start gap-6 hover:shadow-xl transition">
            <div className="w-14 h-14 bg-[#0B3B2C] text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.step1}</h3>
              <p className="text-gray-600">{lang.step1d}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex items-start gap-6 hover:shadow-xl transition">
            <div className="w-14 h-14 bg-[#0B3B2C] text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.step2}</h3>
              <p className="text-gray-600">{lang.step2d}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex items-start gap-6 hover:shadow-xl transition">
            <div className="w-14 h-14 bg-[#0B3B2C] text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.step3}</h3>
              <p className="text-gray-600">{lang.step3d}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex items-start gap-6 hover:shadow-xl transition">
            <div className="w-14 h-14 bg-[#0B3B2C] text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">4</div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.step4}</h3>
              <p className="text-gray-600">{lang.step4d}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-sm">
        <p>© 2026 Warp Joining Booking. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HowItWorksPage;
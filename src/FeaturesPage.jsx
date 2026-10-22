import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
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
      title: 'Features',
      back: '← Back to Home',
      f1: 'Skilled Workers',
      f1d: 'Experienced warp joining experts who deliver quality work.',
      f2: 'Quick Response',
      f2d: 'On-time service at your location, always punctual.',
      f3: 'Quality Assured',
      f3d: 'Strong & neat joins every time, guaranteed.',
      f4: 'Transparent Pricing',
      f4d: 'No hidden charges, clear & fair pricing for all services.',
      appTitle: 'WARP JOINING',
      languageLabel: 'English / தமிழ்',
    },
    Tamil: {
      title: 'அம்சங்கள்',
      back: '← முகப்பு',
      f1: 'திறமையான தொழிலாளர்கள்',
      f1d: 'அனுபவம் வாய்ந்த பாவு இணைக்கும் நிபுணர்கள்.',
      f2: 'விரைவான பதில்',
      f2d: 'உங்கள் இருப்பிடத்தில் சரியான நேரத்தில் சேவை.',
      f3: 'தர உத்தரவாதம்',
      f3d: 'ஒவ்வொரு முறையும் வலுவான & சுத்தமான இணைப்புகள்.',
      f4: 'வெளிப்படையான விலை',
      f4d: 'மறைக்கப்பட்ட கட்டணங்கள் இல்லை, தெளிவான & நியாயமான.',
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

      <main className="max-w-6xl mx-auto px-6 py-16 flex-1">
        <h2 className="text-4xl font-extrabold text-[#0B3B2C] mb-12 text-center">{lang.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="text-5xl mb-4">👨‍🔧</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.f1}</h3>
            <p className="text-gray-600">{lang.f1d}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.f2}</h3>
            <p className="text-gray-600">{lang.f2d}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.f3}</h3>
            <p className="text-gray-600">{lang.f3d}</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.f4}</h3>
            <p className="text-gray-600">{lang.f4d}</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-sm">
        <p>© 2026 Warp Joining Booking. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FeaturesPage;
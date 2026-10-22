import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
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
      title: 'About Us',
      back: '← Back to Home',
      p1: 'Warp Joining Booking is a platform that connects textile customers with skilled warp joining workers instantly.',
      p2: 'Our mission is to reduce loom downtime by providing quick, reliable, and quality warp joining services at your location.',
      workers: 'Workers',
      bookings: 'Bookings',
      satisfaction: 'Satisfaction',
      appTitle: 'WARP JOINING',
      languageLabel: 'English / தமிழ்',
    },
    Tamil: {
      title: 'எங்களை பற்றி',
      back: '← முகப்பு',
      p1: 'பாவு இணைத்தல் பதிவு என்பது துணி வாடிக்கையாளர்களை திறமையான பாவு இணைக்கும் தொழிலாளர்களுடன் உடனே இணைக்கும் ஒரு தளமாகும்.',
      p2: 'எங்கள் நோக்கம் உங்கள் இருப்பிடத்தில் விரைவான, நம்பகமான மற்றும் தரமான பாவு இணைத்தல் சேவைகளை வழங்கி தறி வேலையில்லா நேரத்தை குறைப்பதாகும்.',
      workers: 'தொழிலாளர்கள்',
      bookings: 'முன்பதிவுகள்',
      satisfaction: 'திருப்தி',
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
        <h2 className="text-4xl font-extrabold text-[#0B3B2C] mb-8 text-center">{lang.title}</h2>
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <p className="text-gray-600 text-lg leading-relaxed">{lang.p1}</p>
          <p className="text-gray-600 text-lg leading-relaxed mt-4">{lang.p2}</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-[#0B3B2C]">500+</p>
              <p className="text-sm text-gray-500">{lang.workers}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-[#0B3B2C]">1000+</p>
              <p className="text-sm text-gray-500">{lang.bookings}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl text-center">
              <p className="text-3xl font-bold text-[#0B3B2C]">98%</p>
              <p className="text-sm text-gray-500">{lang.satisfaction}</p>
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

export default AboutPage;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsPage = () => {
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
      title: 'Terms & Conditions',
      back: '← Back to Home',
      appTitle: 'ON - DEMAND WARP JOINING BOOKING WEBSITE',
      languageLabel: 'English / தமிழ்',
      section1: '1. Acceptance of Terms',
      section1d: 'By using this platform, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use our services.',
      section2: '2. User Accounts',
      section2d: 'You must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account and OTP.',
      section3: '3. Booking & Payments',
      section3d: 'All bookings are subject to worker availability. Prices are calculated based on yarn type, size, and distance (if applicable). Payments are processed securely.',
      section4: '4. Cancellation & Refund',
      section4d: 'Customers may cancel bookings within 10 minutes of confirmation for a full refund. Cancellations after work has started are non-refundable.',
      section5: '5. Worker Responsibilities',
      section5d: 'Workers agree to provide high-quality warp joining services. If a worker fails to complete the job, the customer is entitled to a full refund.',
      section6: '6. Limitation of Liability',
      section6d: 'The platform acts as a bridge between customers and workers. We are not responsible for any damages or losses arising from the services provided.',
      section7: '7. Governing Law',
      section7d: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Coimbatore, Tamil Nadu.',
      section8: '8. Changes to Terms',
      section8d: 'We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.',
    },
    Tamil: {
      title: 'விதிமுறைகள் & நிபந்தனைகள்',
      back: '← முகப்பு',
      appTitle: 'பாவு இணைத்தல் பதிவு செய்தல் தளம்',
      languageLabel: 'தமிழ் / English',
      section1: '1. விதிமுறைகளை ஏற்றுக்கொள்வது',
      section1d: 'இந்த தளத்தை பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகள் & நிபந்தனைகளுக்கு இணங்க நீங்கள் ஒப்புக்கொள்கிறீர்கள். நீங்கள் ஒப்புக்கொள்ளவில்லை என்றால், எங்கள் சேவைகளைப் பயன்படுத்த வேண்டாம்.',
      section2: '2. பயனர் கணக்குகள்',
      section2d: 'பதிவின் போது நீங்கள் துல்லியமான தகவல்களை வழங்க வேண்டும். உங்கள் கணக்கு மற்றும் OTP-ன் ரகசியத்தை பராமரிப்பது உங்கள் பொறுப்பு.',
      section3: '3. முன்பதிவு & கட்டணங்கள்',
      section3d: 'அனைத்து முன்பதிவுகளும் தொழிலாளியின் கிடைக்கும் தன்மைக்கு உட்பட்டது. விலைகள் நூல் வகை, அளவு மற்றும் தூரத்தின் அடிப்படையில் கணக்கிடப்படுகின்றன. பணப்பரிவர்த்தனைகள் பாதுகாப்பாக செயலாக்கப்படுகின்றன.',
      section4: '4. ரத்து & பணம் திரும்பப் பெறுதல்',
      section4d: 'வாடிக்கையாளர்கள் உறுதிப்படுத்திய 10 நிமிடங்களுக்குள் முழு பணத்தை திரும்பப் பெறுவதற்காக முன்பதிவுகளை ரத்து செய்யலாம். வேலை தொடங்கிய பிறகு ரத்து செய்தால் பணம் திரும்பக் கிடையாது.',
      section5: '5. தொழிலாளியின் பொறுப்புகள்',
      section5d: 'தொழிலாளர்கள் உயர் தரமான பாவு இணைத்தல் சேவைகளை வழங்க ஒப்புக்கொள்கிறார்கள். ஒரு தொழிலாளி வேலையை முடிக்கத் தவறினால், வாடிக்கையாளர் முழு பணத்தை திரும்பப் பெற உரிமை உண்டு.',
      section6: '6. பொறுப்பு வரம்பு',
      section6d: 'இந்த தளம் வாடிக்கையாளர்களுக்கும் தொழிலாளர்களுக்கும் இடையே ஒரு பாலமாக செயல்படுகிறது. வழங்கப்படும் சேவைகளிலிருந்து ஏற்படும் சேதங்கள் அல்லது இழப்புகளுக்கு நாங்கள் பொறுப்பல்ல.',
      section7: '7. ஆளும் சட்டம்',
      section7d: 'இந்த விதிமுறைகள் இந்திய சட்டங்களால் நிர்வகிக்கப்படுகின்றன. ஏதேனும் தகராறுகள் கோயம்புத்தூர், தமிழ்நாடு நீதிமன்றங்களின் பிரத்தியேக அதிகார வரம்பிற்கு உட்பட்டதாக இருக்கும்.',
      section8: '8. விதிமுறைகளில் மாற்றங்கள்',
      section8d: 'இந்த விதிமுறைகளை எந்த நேரத்திலும் புதுப்பிக்க நாங்கள் உரிமை கொண்டுள்ளோம். தளத்தை தொடர்ந்து பயன்படுத்துவது புதுப்பிக்கப்பட்ட விதிமுறைகளை ஏற்றுக்கொள்வதாகும்.',
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

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <h2 className="text-4xl font-extrabold text-[#0B3B2C] mb-8 text-center">{lang.title}</h2>
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section1}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section1d}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section2}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section2d}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section3}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section3d}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section4}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section4d}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section5}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section5d}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section6}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section6d}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section7}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section7d}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.section8}</h3>
            <p className="text-gray-600 mt-2 leading-relaxed">{lang.section8d}</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-sm">
        <p>© 2026 Warp Joining Booking. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default TermsPage;
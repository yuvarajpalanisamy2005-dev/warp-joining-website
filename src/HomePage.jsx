import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUser, sendOTPviaSMS, verifyOTP } from './api';

const HomePage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // ========== LOGIN STATE ==========
  const [contactInfo, setContactInfo] = useState('');
  const [step, setStep] = useState(1);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);
  const OTP_EXPIRY_MINUTES = 2;

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && (savedLang === 'English' || savedLang === 'Tamil')) {
      setLanguage(savedLang);
    }
  }, []);

  // ========== TIMER EFFECT ==========
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => { setTimer((prev) => prev - 1); }, 1000);
    } else if (timer === 0) { setCanResend(true); }
    return () => clearInterval(interval);
  }, [step, timer]);

  // ========== CLEAR MESSAGES ==========
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(''); setSuccess(''); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'English' ? 'Tamil' : 'English';
      localStorage.setItem('appLanguage', newLang);
      return newLang;
    });
  };

  // ========== VALIDATION ==========
  const validateContact = (info) => {
    if (!info || info.trim() === '') return { valid: false, error: 'Please enter your phone number or email' };
    const trimmed = info.trim();
    const isPhoneNumber = /^\d+$/.test(trimmed);
    if (isPhoneNumber) {
      if (!/^\d{10}$/.test(trimmed)) return { valid: false, error: 'Phone number must be exactly 10 digits!' };
      if (!/^[6-9]/.test(trimmed)) return { valid: false, error: 'Phone number must start with 6, 7, 8, or 9!' };
      return { valid: true, value: trimmed, type: 'phone' };
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmed)) return { valid: false, error: 'Please enter a valid email' };
      return { valid: true, value: trimmed, type: 'email' };
    }
  };

  // ========== 🔥 SEND OTP ==========
  const handleSendOTP = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validation = validateContact(contactInfo);
    if (!validation.valid) { setError(validation.error); return; }

    const info = validation.value;

    try {
      const result = await checkUser(info);
      if (!result.exists) {
        setError('⚠️ No account found! Please Sign Up first.');
        return;
      }

      setIsLoading(true);
      setOtpValues(['', '', '', '']);
      setOtpExpiry(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      try {
        const smsResult = await sendOTPviaSMS(info);

        if (smsResult.success) {
          setSuccess('✅ OTP sent to your ' + (validation.type === 'email' ? 'email!' : 'mobile!'));
        } else {
          setError(smsResult.error || 'Failed to send OTP.');
          setIsLoading(false);
          return;
        }
      } catch (smsError) {
        console.error('SMS Error:', smsError);
        setError('Failed to send OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      setStep(2);
      setTimer(30);
      setCanResend(false);
      setTimeout(() => { if (inputRefs.current[0]) inputRefs.current[0].focus(); }, 100);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [contactInfo]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 3) { inputRefs.current[index + 1].focus(); }
    if (!value && index > 0) { inputRefs.current[index - 1].focus(); }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) { inputRefs.current[index - 1].focus(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const enteredOtp = otpValues.join('');
      if (enteredOtp.length === 4) { handleVerifyOTP(e); }
      else { setError('Please enter complete 4-digit OTP'); }
    }
  };

  // ========== 🔥 VERIFY OTP (Backend) ==========
  const handleVerifyOTP = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const enteredOtp = otpValues.join('').trim().replace(/\D/g, '');
    if (enteredOtp.length !== 4) { setError('Please enter complete 4-digit OTP'); return; }
    if (Date.now() > otpExpiry) { setError('⏰ OTP has expired. Please request a new one.'); return; }

    setIsLoading(true);
    try {
      const result = await verifyOTP(contactInfo.trim(), enteredOtp);

      console.log('🔍 Verify Result:', result);

      if (!result.success) {
        setError(result.error || '❌ Incorrect OTP! Please try again.');
        setOtpValues(['', '', '', '']);
        if (inputRefs.current[0]) { inputRefs.current[0].focus(); }
        return;
      }

      const userResult = await checkUser(contactInfo.trim());
      const userType = userResult.user?.user_type || 'customer';

      setSuccess('🎉 Welcome back! Login successful.');
      localStorage.setItem('warpSession', JSON.stringify({
        user: contactInfo.trim(),
        userType: userType,
        loginTime: Date.now()
      }));

      setTimeout(() => { navigate('/dashboard'); }, 1500);
    } catch (error) {
      console.error('Verify Error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [otpValues, otpExpiry, contactInfo, navigate]);

  // ========== 🔥 RESEND OTP ==========
  const handleResendOTP = useCallback(async () => {
    setError('');
    setSuccess('');
    setOtpValues(['', '', '', '']);
    setOtpExpiry(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    setIsLoading(true);
    try {
      const smsResult = await sendOTPviaSMS(contactInfo.trim());

      if (smsResult.success) {
        setSuccess('✅ OTP resent successfully!');
      } else {
        setError(smsResult.error || 'Resend failed.');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }

    setTimer(30);
    setCanResend(false);
    setTimeout(() => { if (inputRefs.current[0]) inputRefs.current[0].focus(); }, 100);
  }, [contactInfo]);

  const LoadingSpinner = () => (
    <div className="relative inline-block">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  const t = {
    English: {
      appTitle: 'ON - DEMAND WARP JOINING BOOKING WEBSITE',
      tagline: 'Book skilled warp joining workers instantly',
      login: 'Sign In',
      signup: 'Sign Up',
      phonePlaceholder: 'Enter 10-digit mobile or email',
      sendOtpBtn: 'Send OTP',
      sendingBtn: 'Sending...',
      otpLabel: 'Enter 4-digit OTP',
      verifyBtn: 'Verify & Sign In',
      verifyingBtn: 'Verifying...',
      resendBtn: 'Resend OTP',
      resendIn: 'Resend OTP in',
      hint: 'Enter 10 digits (starts with 6,7,8,9) or Email',
      signUpNow: "Don't have an account? Sign Up",
      languageLabel: 'English / தமிழ்',
      menuHome: 'Home',
      menuFeatures: 'Features',
      menuHowItWorks: 'How It Works',
      menuAbout: 'About',
      menuContact: 'Contact',
      menuDashboard: 'Dashboard',
      menuEarnings: 'Earnings',
      menuBookingHistory: 'My Bookings',
      menuLiveLocation: 'Live Location',
      closeMenu: 'Close',
      logout: 'Logout',
    },
    Tamil: {
      appTitle: 'பாவு இணைத்தல் பதிவு செய்தல் தளம்',
      tagline: 'திறமையான பாவு இணைக்கும் தொழிலாளர்களை உடனே பதிவு செய்யவும்',
      login: 'உள்நுழைக',
      signup: 'பதிவு செய்க',
      phonePlaceholder: '10 இலக்க எண் அல்லது மின்னஞ்சலை உள்ளிடவும்',
      sendOtpBtn: 'OTP அனுப்பு',
      sendingBtn: 'அனுப்பப்படுகிறது...',
      otpLabel: '4-இலக்க OTP ஐ உள்ளிடவும்',
      verifyBtn: 'சரிபார்த்து உள்நுழைக',
      verifyingBtn: 'சரிபார்க்கப்படுகிறது...',
      resendBtn: 'மீண்டும் OTP அனுப்பு',
      resendIn: 'மீண்டும் அனுப்ப',
      hint: '10 இலக்க எண் (6,7,8,9-ல தொடங்கும்) அல்லது மின்னஞ்சல்',
      signUpNow: "கணக்கு இல்லையா? பதிவு செய்க",
      languageLabel: 'தமிழ் / English',
      menuHome: 'முகப்பு',
      menuFeatures: 'அம்சங்கள்',
      menuHowItWorks: 'எப்படி வேலை செய்கிறது',
      menuAbout: 'எங்களை பற்றி',
      menuContact: 'தொடர்பு',
      menuDashboard: 'டாஷ்போர்டு',
      menuEarnings: 'வருமானம்',
      menuBookingHistory: 'எனது முன்பதிவுகள்',
      menuLiveLocation: 'நேரடி இருப்பிடம்',
      closeMenu: 'மூடு',
      logout: 'வெளியேறு',
    }
  };

  const lang = t[language];
  const session = localStorage.getItem('warpSession');
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      <header className="bg-[#0B3B2C] text-white shadow-lg py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => setIsMenuOpen(true)} className="flex flex-col gap-1.5 p-2 hover:bg-white/10 rounded-lg transition">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>

          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition">
            <span className="text-2xl font-bold">🧵</span>
            <h1 className="text-xl font-bold tracking-wider">{lang.appTitle}</h1>
          </button>

          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition text-sm border border-white/20">
              <span className="text-lg">🌐</span>
              <span className="hidden md:inline text-sm">{lang.languageLabel}</span>
            </button>
            {isLoggedIn ? (
              <button onClick={() => { localStorage.removeItem('warpSession'); navigate('/'); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold transition text-sm">
                {lang.logout}
              </button>
            ) : (
              <button onClick={() => navigate('/signup')} className="bg-white text-[#0B3B2C] px-4 py-1.5 rounded-lg font-bold hover:bg-gray-100 transition text-sm">
                {lang.signup}
              </button>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative bg-[#0B3B2C] text-white w-72 h-full shadow-2xl overflow-y-auto animate-slide-in-left">
            <div className="p-6">
              <button onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-white/70 hover:text-white transition mb-8">
                <span className="text-2xl">✕</span>
                <span className="text-sm">{lang.closeMenu}</span>
              </button>
              <nav className="flex flex-col gap-4 text-lg font-medium">
                <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">🏠 {lang.menuHome}</button>
                <button onClick={() => { navigate('/features'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">✨ {lang.menuFeatures}</button>
                <button onClick={() => { navigate('/how-it-works'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">📋 {lang.menuHowItWorks}</button>
                <button onClick={() => { navigate('/about'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">ℹ️ {lang.menuAbout}</button>
                <button onClick={() => { navigate('/contact'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">📞 {lang.menuContact}</button>

                {isLoggedIn && (
                  <>
                    <div className="border-t border-white/10 my-2 pt-2"></div>
                    <button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">📊 {lang.menuDashboard}</button>
                    <button onClick={() => { navigate('/booking-history'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">📋 {lang.menuBookingHistory}</button>
                    <button onClick={() => { navigate('/earnings'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">💰 {lang.menuEarnings}</button>
                    <button onClick={() => { navigate('/live-location'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition">🗺️ {lang.menuLiveLocation}</button>
                  </>
                )}

                <div className="border-t border-white/10 my-4 pt-4">
                  <button onClick={() => { toggleLanguage(); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition w-full">🌐 {lang.languageLabel}</button>
                  {!isLoggedIn ? (
                    <>
                      <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition w-full">🔐 {lang.login}</button>
                      <button onClick={() => { navigate('/signup'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl transition w-full font-bold">✨ {lang.signup}</button>
                    </>
                  ) : (
                    <button onClick={() => { localStorage.removeItem('warpSession'); navigate('/'); setIsMenuOpen(false); }} className="flex items-center gap-3 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition w-full text-red-300 font-bold">🚪 {lang.logout}</button>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ========== HERO SECTION ========== */}
      <section className="bg-[#0B3B2C] text-white min-h-[600px] flex items-center flex-1">
        <div className="max-w-6xl mx-auto px-6 py-16 w-full">
          <div className="flex flex-col md:flex-row items-center gap-10">
            
            {/* ✅ LEFT SIDE - YOUR CUSTOM IMAGE */}
            <div className="w-full md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                    src="/warp-workers.jpg"
                    alt="Warp joining expert working on textile machine"
                    className="w-full h-[420px] object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Backup URL if local image fails
                      e.target.src = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B3B2C]/70 via-[#0B3B2C]/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-white/10">
                  <p className="text-sm text-emerald-300 font-semibold flex items-center gap-2">
                    <span className="text-lg">🧵</span> 
                    <span>Warp Joining Expert at Work</span>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - LOGIN BOX */}
            <div className="w-full md:w-1/2">
              <div className="text-5xl md:text-6xl mb-3">🧵</div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-2 leading-tight">
                {lang.appTitle}
              </h1>
              <p className="text-lg text-emerald-200 mb-6">{lang.tagline}</p>

              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-200">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-3 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg mb-3 text-sm">
                    {success}
                  </div>
                )}

                {step === 1 && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder={lang.phonePlaceholder}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] text-gray-800 placeholder:text-gray-400 text-lg"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendOTP(e); }}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">📱 {lang.hint}</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition flex items-center justify-center ${
                        isLoading ? 'bg-[#1a5c45] cursor-not-allowed' : 'bg-[#0B3B2C] hover:bg-[#1a5c45]'
                      }`}
                    >
                      {isLoading ? (
                        <><LoadingSpinner /><span className="ml-2">{lang.sendingBtn}</span></>
                      ) : (
                        lang.sendOtpBtn
                      )}
                    </button>
                    <div className="text-center text-sm">
                      <button type="button" onClick={() => navigate('/signup')} className="text-[#0B3B2C] hover:text-[#1a5c45] font-bold hover:underline transition">
                        {lang.signUpNow}
                      </button>
                    </div>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center">
                      <p className="text-sm text-gray-600">OTP sent to:</p>
                      <p className="font-bold text-gray-800 text-lg break-all">{contactInfo}</p>
                      <p className="text-xs text-gray-400 mt-1">⏱ Valid for {OTP_EXPIRY_MINUTES} minutes</p>
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-semibold mb-2 text-center">{lang.otpLabel}</label>
                      <div className="flex justify-center gap-3">
                        {otpValues.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength="1"
                            className="w-14 h-16 text-center text-2xl font-bold bg-white border-2 border-gray-300 rounded-xl focus:border-[#0B3B2C] focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] text-gray-800"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            onFocus={(e) => e.target.select()}
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-center text-sm">
                      {canResend ? (
                        <button type="button" onClick={handleResendOTP} className="text-[#0B3B2C] hover:text-[#1a5c45] transition font-bold underline">
                          {lang.resendBtn}
                        </button>
                      ) : (
                        <span className="text-gray-500">{lang.resendIn} <span className="text-red-500 font-bold">{timer}s</span></span>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition flex items-center justify-center ${
                        isLoading ? 'bg-[#1a5c45] cursor-not-allowed' : 'bg-[#0B3B2C] hover:bg-[#1a5c45]'
                      }`}
                    >
                      {isLoading ? (
                        <><LoadingSpinner /><span className="ml-2">{lang.verifyingBtn}</span></>
                      ) : (
                        lang.verifyBtn
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in-left { animation: slideInLeft 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default HomePage;
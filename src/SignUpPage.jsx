import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, checkUser, sendOTPviaSMS, verifyOTP } from './api';

const SignUpPage = () => {
  const navigate = useNavigate();
  
  const [userType, setUserType] = useState('customer');
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState('English');

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const MAX_OTP_ATTEMPTS = 3;
  const OTP_EXPIRY_MINUTES = 2;

  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState('beginner');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });

  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ========== LOAD LANGUAGE ==========
  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && (savedLang === 'English' || savedLang === 'Tamil')) {
      setLanguage(savedLang);
    }
  }, []);

  // ========== TRANSLATIONS ==========
  const translations = {
    English: {
      appTitle: 'ON - DEMAND WARP JOINING BOOKING WEBSITE',
      title: 'Create an Account',
      nameLabel: 'Full Name',
      namePlaceholder: 'Enter your full name',
      contactLabel: 'Phone Number or Email',
      contactPlaceholder: 'Enter 10-digit mobile or email',
      userTypeLabel: 'I am a',
      customer: 'Customer',
      worker: 'Worker',
      sendOtpBtn: 'Send OTP',
      sendingBtn: 'Sending...',
      otpLabel: 'Enter 4-digit OTP',
      verifyBtn: 'Verify & Continue',
      verifyingBtn: 'Verifying...',
      resendIn: 'Resend OTP in',
      resendBtn: 'Resend OTP',
      backBtn: 'Already have an account? Sign In',
      skillsLabel: 'Select Yarn Types you can work with',
      experienceLabel: 'Experience Level',
      beginner: 'Beginner',
      experienced: 'Experienced',
      addressLabel: 'Your Address',
      addressPlaceholder: 'Enter your full address',
      locationLabel: 'Current Location',
      getLocation: 'Get Current Location',
      completeBtn: 'Complete Sign Up',
      languageLabel: 'English / தமிழ்',
      hint: 'Enter 10 digits (starts with 6,7,8,9) or Email',
      home: 'Home',
      errors: {
        required: 'Please enter your phone number or email',
        invalidPhone: 'Phone number must be exactly 10 digits!',
        invalidStart: 'Phone number must start with 6, 7, 8, or 9!',
        invalidEmail: 'Please enter a valid email',
        otpExpired: 'OTP has expired. Please request a new one.',
        tooManyAttempts: 'Too many failed attempts.',
        invalidOTP: 'Incorrect OTP! Please try again.',
        sendFailed: 'Failed to send OTP. Please try again.',
        generalError: 'An error occurred.',
        accountExists: '⚠️ Account already exists! Please Login.',
        skillRequired: 'Please select at least one skill.',
        addressRequired: 'Please enter your address.',
      },
      success: {
        otpSent: 'OTP sent successfully!',
        signupSuccess: 'Account created successfully! 🎉',
      }
    },
    Tamil: {
      appTitle: 'பாவு இணைத்தல் பதிவு செய்தல் தளம்',
      title: 'புதிய கணக்கு',
      nameLabel: 'முழு பெயர்',
      namePlaceholder: 'உங்கள் முழு பெயரை உள்ளிடவும்',
      contactLabel: 'தொலைபேசி எண் அல்லது மின்னஞ்சல்',
      contactPlaceholder: '10 இலக்க எண் அல்லது மின்னஞ்சலை உள்ளிடவும்',
      userTypeLabel: 'நான் ஒரு',
      customer: 'வாடிக்கையாளர்',
      worker: 'தொழிலாளி',
      sendOtpBtn: 'OTP அனுப்பு',
      sendingBtn: 'அனுப்பப்படுகிறது...',
      otpLabel: '4-இலக்க OTP ஐ உள்ளிடவும்',
      verifyBtn: 'சரிபார்த்து தொடரவும்',
      verifyingBtn: 'சரிபார்க்கப்படுகிறது...',
      resendIn: 'மீண்டும் அனுப்ப',
      resendBtn: 'மீண்டும் OTP அனுப்பு',
      backBtn: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக',
      skillsLabel: 'நீங்கள் வேலை செய்யக்கூடிய நூல் வகைகளைத் தேர்ந்தெடுக்கவும்',
      experienceLabel: 'அனுபவ நிலை',
      beginner: 'தொடக்கநிலை',
      experienced: 'அனுபவம்',
      addressLabel: 'உங்கள் முகவரி',
      addressPlaceholder: 'உங்கள் முழு முகவரியை உள்ளிடவும்',
      locationLabel: 'தற்போதைய இருப்பிடம்',
      getLocation: 'இருப்பிடத்தைப் பெறுக',
      completeBtn: 'பதிவை முடிக்கவும்',
      languageLabel: 'தமிழ் / English',
      hint: '10 இலக்க எண் (6,7,8,9-ல தொடங்கும்) அல்லது மின்னஞ்சல்',
      home: 'முகப்பு',
      errors: {
        required: 'உங்கள் தொலைபேசி எண் அல்லது மின்னஞ்சலை உள்ளிடவும்',
        invalidPhone: 'தொலைபேசி எண் சரியாக 10 இலக்கங்கள்!',
        invalidStart: 'தொலைபேசி எண் 6, 7, 8, அல்லது 9-ல தொடங்க வேண்டும்!',
        invalidEmail: 'சரியான மின்னஞ்சலை உள்ளிடவும்',
        otpExpired: 'OTP காலாவதியாகிவிட்டது.',
        tooManyAttempts: 'பல முறை தவறியது.',
        invalidOTP: 'தவறான OTP! மீண்டும் முயற்சிக்கவும்.',
        sendFailed: 'OTP அனுப்ப முடியவில்லை.',
        generalError: 'பிழை ஏற்பட்டது.',
        accountExists: '⚠️ கணக்கு ஏற்கனவே உள்ளது! உள்நுழையவும்.',
        skillRequired: 'குறைந்தது ஒரு திறனையாவது தேர்ந்தெடுக்கவும்.',
        addressRequired: 'உங்கள் முகவரியை உள்ளிடவும்.',
      },
      success: {
        otpSent: 'OTP வெற்றிகரமாக அனுப்பப்பட்டது!',
        signupSuccess: 'கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! 🎉',
      }
    }
  };

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'English' ? 'Tamil' : 'English';
      localStorage.setItem('appLanguage', newLang);
      return newLang;
    });
  };

  // ========== TIMER EFFECT ==========
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => { setTimer((prev) => prev - 1); }, 1000);
    } else if (timer === 0) { setCanResend(true); }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => { setError(''); setSuccess(''); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // ========== VALIDATION ==========
  const validateContact = (info) => {
    if (!info || info.trim() === '') return { valid: false, error: t.errors.required };
    const trimmed = info.trim();
    const isPhoneNumber = /^\d+$/.test(trimmed);
    if (isPhoneNumber) {
      if (!/^\d{10}$/.test(trimmed)) {
        return { valid: false, error: t.errors.invalidPhone };
      }
      if (!/^[6-9]/.test(trimmed)) {
        return { valid: false, error: t.errors.invalidStart };
      }
      return { valid: true, value: trimmed, type: 'phone' };
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(trimmed)) {
        return { valid: false, error: t.errors.invalidEmail };
      }
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
      if (result.exists) {
        setError(t.errors.accountExists);
        return;
      }

      setIsLoading(true);
      setOtpValues(['', '', '', '']);
      setOtpExpiry(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      // ========== 🔥 SEND OTP ==========
      try {
        const smsResult = await sendOTPviaSMS(info);

        if (smsResult.success) {
          setSuccess('✅ OTP sent to your ' + (validation.type === 'email' ? 'email!' : 'mobile!'));
        } else {
          setSuccess('⚠️ ' + (smsResult.error || 'Failed to send OTP.'));
          setIsLoading(false);
          return;
        }
      } catch (smsError) {
        console.error('SMS Error:', smsError);
        setError(t.errors.sendFailed);
        setIsLoading(false);
        return;
      }

      setStep(2);
      setTimer(30);
      setCanResend(false);
      setTimeout(() => { if (inputRefs.current[0]) inputRefs.current[0].focus(); }, 100);

    } catch (error) {
      setError(t.errors.sendFailed);
    } finally {
      setIsLoading(false);
    }
  }, [contactInfo, t]);

  // ========== OTP HANDLERS ==========
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 3) inputRefs.current[index + 1].focus();
    if (!value && index > 0) inputRefs.current[index - 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // ========== 🔥 VERIFY OTP (Backend) ==========
  const handleVerifyOTP = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const enteredOtp = otpValues.join('');
    if (enteredOtp.length !== 4) { setError('Please enter complete 4-digit OTP'); return; }
    if (Date.now() > otpExpiry) { setError(t.errors.otpExpired); return; }

    setIsLoading(true);
    try {
      const result = await verifyOTP(contactInfo.trim(), enteredOtp);

      if (!result.success) {
        setError(result.error || t.errors.invalidOTP);
        setOtpValues(['', '', '', '']);
        if (inputRefs.current[0]) inputRefs.current[0].focus();
        return;
      }

      setSuccess('✅ OTP verified!');
      setStep(3);
    } catch (error) {
      setError(t.errors.generalError);
    } finally {
      setIsLoading(false);
    }
  }, [otpValues, otpExpiry, contactInfo, t]);

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
      setError(t.errors.sendFailed);
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }

    setTimer(30);
    setCanResend(false);
    setTimeout(() => { if (inputRefs.current[0]) inputRefs.current[0].focus(); }, 100);
  }, [contactInfo, t]);

  // ========== COMPLETE SIGN UP ==========
  const handleCompleteSignUp = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (userType === 'worker' && skills.length === 0) { setError(t.errors.skillRequired); return; }
    if (!address.trim()) { setError(t.errors.addressRequired); return; }

    setIsLoading(true);
    try {
      const userData = {
        name: name.trim(),
        contact: contactInfo.trim(),
        userType: userType,
        address: address.trim(),
        location: location,
        skills: skills,
        experience: experience
      };

      const result = await createUser(userData);

      if (!result.success) {
        setError(result.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      setSuccess(t.success.signupSuccess);
      localStorage.setItem('warpSession', JSON.stringify({
        user: contactInfo.trim(),
        userType: userType,
        loginTime: Date.now()
      }));

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setError(t.errors.generalError);
    } finally {
      setIsLoading(false);
    }
  }, [name, contactInfo, userType, address, location, skills, experience, t, navigate]);

  // ========== GET LOCATION ==========
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); setSuccess('Location fetched!'); },
        () => { setError('Unable to fetch location.'); }
      );
    } else { setError('Geolocation not supported.'); }
  };

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) setSkills(skills.filter(s => s !== skill));
    else setSkills([...skills, skill]);
  };

  const LoadingSpinner = () => (
    <div className="relative inline-block">
      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-100">
      <header className="bg-[#0B3B2C] text-white shadow-lg py-4 px-6 relative flex justify-center items-center">
        <button onClick={() => navigate('/')} className="absolute left-4 md:left-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm font-semibold transition">🏠 {t.home}</button>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider text-center flex items-center gap-2"><span>🧵</span> {t.appTitle}</h1>
        <div className="absolute right-4 md:right-6 flex items-center gap-2">
          <button onClick={toggleLanguage} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition border border-white/20"><span className="text-lg">🌐</span><span className="font-medium text-sm">{t.languageLabel}</span></button>
          <button onClick={() => navigate('/login')} className="bg-white text-[#0B3B2C] hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold transition">{language === 'English' ? 'Sign In' : 'உள்நுழைக'}</button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-200">
          {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-4">{error}<button onClick={() => setError('')} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-xl">×</button></div>}
          {success && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg relative mb-4">{success}<button onClick={() => setSuccess('')} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-xl">×</button></div>}

          <h2 className="text-2xl font-extrabold text-center text-[#0B3B2C] mb-6 tracking-wider">{t.title}</h2>

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div><label className="block text-gray-700 text-sm font-semibold mb-2">{t.nameLabel}</label><input type="text" placeholder={t.namePlaceholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] text-gray-800 placeholder:text-gray-400" value={name} onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} onKeyDown={(e) => { if (e.key === 'Enter') handleSendOTP(e); }} required /></div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">{t.contactLabel}</label>
                <input type="text" placeholder={t.contactPlaceholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] text-gray-800 placeholder:text-gray-400" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSendOTP(e); }} required />
                <p className="text-xs text-gray-500 mt-1">📱 {t.hint}</p>
              </div>
              <div><label className="block text-gray-700 text-sm font-semibold mb-2">{t.userTypeLabel}</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setUserType('customer')} className={`flex-1 py-2 px-4 rounded-xl border-2 transition ${userType === 'customer' ? 'border-[#0B3B2C] bg-[#0B3B2C]/10 text-[#0B3B2C] font-bold' : 'border-gray-300'}`}>{t.customer}</button>
                  <button type="button" onClick={() => setUserType('worker')} className={`flex-1 py-2 px-4 rounded-xl border-2 transition ${userType === 'worker' ? 'border-[#0B3B2C] bg-[#0B3B2C]/10 text-[#0B3B2C] font-bold' : 'border-gray-300'}`}>{t.worker}</button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition flex items-center justify-center ${isLoading ? 'bg-[#1a5c45] cursor-not-allowed' : 'bg-[#0B3B2C] hover:bg-[#1a5c45]'}`}>
                {isLoading ? <><LoadingSpinner /><span className="ml-2">{t.sendingBtn}</span></> : t.sendOtpBtn}
              </button>
              <div className="text-center text-sm">
                <button type="button" onClick={() => navigate('/login')} className="text-[#0B3B2C] hover:text-[#1a5c45] font-bold hover:underline transition">{t.backBtn}</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-center"><p className="text-sm text-gray-600">{language === 'English' ? 'OTP sent to:' : 'OTP அனுப்பப்பட்ட முகவரி:'}</p><p className="font-bold text-[#0B3B2C] text-lg">{contactInfo}</p><p className="text-xs text-gray-500 mt-1">⏱ {language === 'English' ? 'Valid for' : 'செல்லுபடியாகும்'} {OTP_EXPIRY_MINUTES} {language === 'English' ? 'minutes' : 'நிமிடங்கள்'}</p></div>
              <div><label className="block text-gray-700 text-sm font-semibold mb-2 text-center">{t.otpLabel}</label>
                <div className="flex justify-center gap-3">
                  {otpValues.map((digit, index) => (<input key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" maxLength="1" className="w-14 h-16 text-center text-2xl font-bold bg-white border-2 border-gray-300 rounded-xl focus:border-[#0B3B2C] focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] text-gray-800" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(e, index)} onFocus={(e) => e.target.select()} autoFocus={index === 0} />))}
                </div>
              </div>
              <div className="text-center text-sm font-medium">
                {canResend ? <button type="button" onClick={handleResendOTP} className="text-[#0B3B2C] hover:text-[#1a5c45] font-bold underline">{t.resendBtn}</button> : <span className="text-gray-500">{t.resendIn} <span className="text-red-500 font-bold">{timer}s</span></span>}
              </div>
              <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition flex items-center justify-center ${isLoading ? 'bg-[#1a5c45] cursor-not-allowed' : 'bg-[#0B3B2C] hover:bg-[#1a5c45]'}`}>
                {isLoading ? <><LoadingSpinner /><span className="ml-2">{t.verifyingBtn}</span></> : t.verifyBtn}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 text-sm underline">Change phone/email</button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleCompleteSignUp} className="space-y-5">
              <div><label className="block text-gray-700 text-sm font-semibold mb-2">{t.addressLabel}</label><input type="text" placeholder={t.addressPlaceholder} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] text-gray-800 placeholder:text-gray-400" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
              <div><label className="block text-gray-700 text-sm font-semibold mb-2">{t.locationLabel}</label><button type="button" onClick={getCurrentLocation} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition">{t.getLocation}</button> {location.lat && <span className="text-sm text-[#0B3B2C] ml-2 font-semibold">📍 Captured</span>}</div>
              {userType === 'worker' && (
                <>
                  <div><label className="block text-gray-700 text-sm font-semibold mb-2">{t.skillsLabel}</label><div className="flex flex-wrap gap-2">{['Cotton', 'Polyester', 'Silk'].map((skill) => (<button key={skill} type="button" onClick={() => toggleSkill(skill.toLowerCase())} className={`px-4 py-2 rounded-full border-2 transition ${skills.includes(skill.toLowerCase()) ? 'border-[#0B3B2C] bg-[#0B3B2C]/10 text-[#0B3B2C] font-bold' : 'border-gray-300'}`}>{skill}</button>))}</div></div>
                  <div><label className="block text-gray-700 text-sm font-semibold mb-2">{t.experienceLabel}</label><div className="flex gap-4"><button type="button" onClick={() => setExperience('beginner')} className={`flex-1 py-2 px-4 rounded-xl border-2 transition ${experience === 'beginner' ? 'border-[#0B3B2C] bg-[#0B3B2C]/10 text-[#0B3B2C] font-bold' : 'border-gray-300'}`}>{t.beginner}</button><button type="button" onClick={() => setExperience('experienced')} className={`flex-1 py-2 px-4 rounded-xl border-2 transition ${experience === 'experienced' ? 'border-[#0B3B2C] bg-[#0B3B2C]/10 text-[#0B3B2C] font-bold' : 'border-gray-300'}`}>{t.experienced}</button></div></div>
                </>
              )}
              <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition flex items-center justify-center ${isLoading ? 'bg-[#1a5c45] cursor-not-allowed' : 'bg-[#0B3B2C] hover:bg-[#1a5c45]'}`}>
                {isLoading ? <><LoadingSpinner /><span className="ml-2">Saving...</span></> : t.completeBtn}
              </button>
              <div className="text-center text-sm">
                <button type="button" onClick={() => navigate('/login')} className="text-[#0B3B2C] hover:text-[#1a5c45] font-medium hover:underline transition">{t.backBtn}</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
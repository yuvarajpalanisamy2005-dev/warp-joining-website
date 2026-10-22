import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking, getWorkers, checkUser } from './api';

const BookingPage = () => {
  const navigate = useNavigate();
  
  const [language, setLanguage] = useState('English');
  const [yarn, setYarn] = useState('cotton');
  const [size, setSize] = useState(1);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrices = { cotton: 500, polyester: 400, silk: 700 };
  const price = basePrices[yarn] * size;

  // ========== DISTANCE CALCULATION ==========
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // ========== TRANSLATIONS ==========
  const translations = {
    English: {
      title: 'Create New Booking', yarnLabel: 'Select Yarn Type', yarnCotton: 'Cotton', yarnPolyester: 'Polyester', yarnSilk: 'Silk',
      sizeLabel: 'Select Size', priceLabel: 'Total Price', addressLabel: 'Work Address', addressPlaceholder: 'Enter your full address',
      locationBtn: '📍 Get Current Location', locationSuccess: 'Location captured!', confirmBtn: '✅ Confirm Booking',
      backBtn: '← Back to Dashboard', languageLabel: 'English / தமிழ்', distanceNote: '💡 Distance-Based Pricing Applied',
      errors: { addressRequired: 'Please enter your work address' }
    },
    Tamil: {
      title: 'புதிய முன்பதிவு', yarnLabel: 'நூல் வகை', yarnCotton: 'பருத்தி', yarnPolyester: 'பாலியஸ்டர்', yarnSilk: 'பட்டு',
      sizeLabel: 'அளவு', priceLabel: 'மொத்த விலை', addressLabel: 'வேலை முகவரி', addressPlaceholder: 'முகவரியை உள்ளிடவும்',
      locationBtn: '📍 தற்போதைய இருப்பிடம்', locationSuccess: 'இருப்பிடம் கிடைத்தது!', confirmBtn: '✅ முன்பதிவை உறுதி செய்',
      backBtn: '← டாஷ்போர்டுக்கு செல்லவும்', languageLabel: 'தமிழ் / English', distanceNote: '💡 தூரத்தின் அடிப்படையில் விலை',
      errors: { addressRequired: 'முகவரியை உள்ளிடவும்' }
    }
  };

  const t = translations[language];

  // ========== WORKER MATCHING ==========
  const matchWorkers = (workersList, booking) => {
    let workers = workersList.filter(worker => worker.user_type === 'worker');
    
    // Skill Filter
    workers = workers.filter(worker => {
      if (!worker.skills) return false;
      try {
        const skills = JSON.parse(worker.skills);
        return skills.includes(booking.yarn.toLowerCase());
      } catch(e) { return false; }
    });
    
    // Calculate Distance & Dynamic Extra Charge
    workers = workers.map(worker => {
      const wLat = parseFloat(worker.location_lat) || 11.0168;
      const wLng = parseFloat(worker.location_lng) || 77.0333;
      
      const distance = calculateDistance(
        booking.location.lat, booking.location.lng, wLat, wLng
      );
      
      let extraCharge = 0;
      if (distance > 5) {
        const extraKm = distance - 5;
        const extraSlabs = Math.ceil(extraKm / 2);
        extraCharge = extraSlabs * 50;
      }
      
      return { 
        ...worker, 
        distance: Math.round(distance * 100) / 100,
        extraCharge: extraCharge,
        finalPrice: booking.price + extraCharge
      };
    });
    
    // Sort by Distance
    workers.sort((a, b) => a.distance - b.distance);
    return workers;
  };

  // ========== LOAD USER DATA ==========
  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && (savedLang === 'English' || savedLang === 'Tamil')) {
      setLanguage(savedLang);
    }

    const loadUserData = async () => {
      const session = JSON.parse(localStorage.getItem('warpSession') || '{}');
      if (session.user) {
        const userRes = await checkUser(session.user);
        if (userRes.exists) {
          setCustomerPhone(userRes.user.contact);
          setCustomerName(userRes.user.name || 'Customer');
        }
      }
    };
    loadUserData();
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'English' ? 'Tamil' : 'English');
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          alert(t.locationSuccess);
        },
        () => { alert('Unable to fetch location. Please enter address manually.'); },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation not supported by your browser.');
    }
  };

  // ========== 🔥 CONFIRM BOOKING (FIXED WITH WORKER ID) ==========
  const handleConfirmBooking = async () => {
    if (!address.trim()) {
      alert(t.errors.addressRequired);
      return;
    }
    
    const currentLoc = location.lat ? location : { lat: 13.0827, lng: 80.2707 };
    setIsSubmitting(true);
    
    try {
      // 1. Fetch Workers & Find Best Match
      let workersList = await getWorkers();
      const dummyBooking = { yarn: yarn, price: price, location: currentLoc };
      const matchedWorkers = matchWorkers(workersList, dummyBooking);

      // 2. 🔥 Assign the first matched worker to this booking
      let assignedWorkerId = null;
      if (matchedWorkers.length > 0) {
        assignedWorkerId = matchedWorkers[0].id; 
      }

      const bookingData = {
        customerName: customerName,
        customerPhone: customerPhone,
        yarn: yarn,
        size: size,
        price: price,
        address: address,
        location: currentLoc,
        workerId: assignedWorkerId // <--- இதைத்தான் Backend-க்கு அனுப்புறோம்
      };

      // 3. Save to Database
      const result = await createBooking(bookingData);
      
      if (!result.success) {
        alert('Failed to create booking: ' + (result.error || 'Unknown error'));
        setIsSubmitting(false);
        return;
      }
      
      // 4. Show Success Message
      if (assignedWorkerId) {
        alert(`✅ Booking Confirmed!\n\nA worker has been notified and will contact you soon.`);
      } else {
        alert(`✅ Booking Created!\n\nWe are finding a worker for you. Please check back later.`);
      }

      navigate('/dashboard');
      
    } catch (error) {
      console.error(error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col font-sans">
      <header className="bg-white/80 shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-blue-800">{t.title}</h1>
        <button onClick={toggleLanguage} className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 rounded-full px-4 py-2 transition">
          <span className="text-lg">🌐</span>
          <span className="font-medium text-sm">{t.languageLabel}</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
          <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">{t.title}</h2>

          <div className="bg-gray-50 rounded-xl p-3 mb-6 text-sm">
            <p><strong>👤 {language === 'English' ? 'Customer' : 'வாடிக்கையாளர்'}:</strong> {customerName}</p>
            <p><strong>📞 {language === 'English' ? 'Phone' : 'தொலைபேசி'}:</strong> {customerPhone}</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">{t.yarnLabel}</label>
            <div className="flex gap-3">
              {['cotton', 'polyester', 'silk'].map((type) => (
                <button key={type} onClick={() => setYarn(type)} className={`flex-1 py-3 px-4 rounded-xl border-2 transition font-medium ${yarn === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}>
                  {t[`yarn${type.charAt(0).toUpperCase() + type.slice(1)}`]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">{t.sizeLabel}</label>
            <div className="flex gap-3">
              {[1, 1.5, 2].map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`flex-1 py-3 px-4 rounded-xl border-2 transition font-medium ${size === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-gray-600">{t.priceLabel}</p>
            <p className="text-3xl font-bold text-green-700">₹{price}</p>
            <p className="text-xs text-gray-500 mt-1">{yarn} × {size} = ₹{price}</p>
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700">{t.distanceNote}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">{t.addressLabel}</label>
            <input type="text" placeholder={t.addressPlaceholder} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={address} onChange={(e) => setAddress(e.target.value)} />
            <button onClick={getLocation} className="mt-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition w-full">{t.locationBtn}</button>
            {location.lat && <p className="text-xs text-green-600 mt-1">✅ Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>}
          </div>

          <button onClick={handleConfirmBooking} disabled={isSubmitting} className={`w-full text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isSubmitting ? 'Booking...' : t.confirmBtn}
          </button>

          <button onClick={() => navigate('/dashboard')} className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 text-sm text-center underline transition-all mt-3">{t.backBtn}</button>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
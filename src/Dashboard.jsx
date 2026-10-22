import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerBookings, getWorkerBookings, updateBookingStatus, checkUser, addRating } from './api';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [language, setLanguage] = useState('English');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [workerBookings, setWorkerBookings] = useState([]);
  const [customerPendingConfirm, setCustomerPendingConfirm] = useState([]);

  const t = {
    English: {
      welcome: 'Welcome', logout: 'Logout', worker: 'Worker', customer: 'Customer', totalBookings: 'Total Bookings',
      completed: 'Completed', pending: 'Pending', noCompleted: 'No completed bookings', noPending: 'No pending bookings',
      loading: 'Loading...', appTitle: 'WARP JOINING', languageLabel: 'English / தமிழ்', newBooking: '➕ New Booking',
      availableJobs: '📋 Available Jobs', noJobs: 'No jobs available.', accept: '✅ Accept', acceptSuccess: '✅ Booking Accepted!',
      myBookings: '📋 My Bookings', noMyBookings: 'You have no bookings yet.', onDuty: '🟢 ON DUTY', offDuty: '🔴 OFF DUTY',
      bookingHistory: '📋 My Bookings', earnings: '💰 Earnings', markComplete: '✅ Mark as Completed', confirmComplete: '✅ Confirm Completion',
      inProgress: '⏳ In Progress', waitingConfirm: '⏳ Waiting Confirmation',
    },
    Tamil: {
      welcome: 'நல்வரவு', logout: 'வெளியேறு', worker: 'தொழிலாளி', customer: 'வாடிக்கையாளர்', totalBookings: 'மொத்த முன்பதிவுகள்',
      completed: 'முடிந்தவை', pending: 'நிலுவையில்', noCompleted: 'முடிந்தவை இல்லை', noPending: 'நிலுவையில் இல்லை',
      loading: 'ஏற்றுகிறது...', appTitle: 'பாவு இணைத்தல்', languageLabel: 'தமிழ் / English', newBooking: '➕ புதிய முன்பதிவு',
      availableJobs: '📋 கிடைக்கும் வேலைகள்', noJobs: 'வேலைகள் இல்லை', accept: '✅ ஏற்றுக்கொள்', acceptSuccess: '✅ முன்பதிவு ஏற்றுக்கொள்ளப்பட்டது!',
      myBookings: '📋 எனது முன்பதிவுகள்', noMyBookings: 'முன்பதிவுகள் இல்லை', onDuty: '🟢 பணியில்', offDuty: '🔴 பணியில் இல்லை',
      bookingHistory: '📋 எனது முன்பதிவுகள்', earnings: '💰 வருமானம்', markComplete: '✅ முடிந்ததாக குறி', confirmComplete: '✅ முடிந்ததை உறுதி செய்',
      inProgress: '⏳ நடந்துகொண்டிருக்கிறது', waitingConfirm: '⏳ காத்திருக்கிறது',
    }
  }[language];

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

  const loadData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('warpSession') || '{}');
      if (!session.user) { setLoading(false); return; }

      const contact = session.user;
      const userRes = await checkUser(contact);
      
      if (userRes.exists) {
        const user = {
            id: userRes.user.id, contact: userRes.user.contact, userType: userRes.user.user_type,
            name: userRes.user.name || 'User', availability: 'available'
        };
        setUserData(user);
        setIsOnDuty(user.availability === 'available');

        if (user.userType === 'worker') {
          const allBookings = await getWorkerBookings(user.id); 
          setAvailableBookings(allBookings.filter(b => b.status === 'pending'));
          setWorkerBookings(allBookings.filter(b => b.status === 'in-progress' || b.status === 'waiting-confirmation'));
        } else if (user.userType === 'customer') {
          const bookings = await getCustomerBookings(contact);
          setMyBookings(bookings);
          setCustomerPendingConfirm(bookings.filter(b => b.status === 'waiting-confirmation'));
        }
      } else {
        setUserData(null);
      }
    } catch (error) { console.error('Error loading data:', error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const toggleDutyStatus = () => {
    if (!userData) return;
    setIsOnDuty(!isOnDuty);
    alert(isOnDuty ? '🔴 You are now OFF DUTY' : '🟢 You are now ON DUTY');
  };

  // 🔥 FIXED: Accept பண்ணும்போது userData.id அனுப்புறோம்
  const handleAcceptBooking = async (bookingId) => {
    try {
      const result = await updateBookingStatus(bookingId, 'in-progress', userData.id);
      if (result.success) { alert(t.acceptSuccess); loadData(); }
    } catch (error) { alert('Error accepting booking'); }
  };

  // 🔥 FIXED: Complete பண்ணும்போது userData.id அனுப்புறோம்
  const handleMarkComplete = async (bookingId) => {
    try {
      const result = await updateBookingStatus(bookingId, 'waiting-confirmation', userData.id);
      if (result.success) { alert('✅ Work completed! Waiting for customer confirmation.'); loadData(); }
    } catch (error) { alert('Error updating status'); }
  };

  // 🔥 Customer Confirm பண்ணி ரேட்டிங் குடுக்கணும்
  const handleConfirmComplete = async (bookingId) => {
    try {
      const result = await updateBookingStatus(bookingId, 'completed');
      if (result.success) {
        const ratingInput = prompt("✅ Work Completed!\n\nPlease rate the worker from 1 to 5 stars:", "5");
        if (ratingInput) {
          const ratingNum = Number(ratingInput);
          if (ratingNum >= 1 && ratingNum <= 5) {
            await addRating(bookingId, ratingNum);
            alert('🙏 Thank you for your rating!');
          } else {
            alert('Invalid rating. Please enter between 1 and 5.');
          }
        }
        loadData(); 
      }
    } catch (error) { alert('Error confirming completion'); }
  };

  const handleLogout = () => { localStorage.removeItem('warpSession'); navigate('/'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">{t.loading}</div>;
  if (!userData) return <div className="min-h-screen flex items-center justify-center text-xl">Please Login Again.</div>;

  const isWorker = userData.userType === 'worker';
  const displayName = userData.name;

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'waiting-confirmation': return 'bg-orange-100 text-orange-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-100">
      <header className="bg-[#0B3B2C] text-white shadow-lg py-4 px-6 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3"><span className="text-2xl">🧵</span><h1 className="text-xl font-bold tracking-wider">{t.appTitle}</h1></div>
        <div className="flex flex-wrap items-center gap-3">
          {isWorker && (
            <>
              <button onClick={toggleDutyStatus} className={`px-4 py-2 rounded-lg font-bold text-sm shadow-md ${isOnDuty ? 'bg-green-500' : 'bg-red-500'}`}>{isOnDuty ? t.onDuty : t.offDuty}</button>
              <button onClick={() => navigate('/earnings')} className="bg-yellow-500 px-4 py-2 rounded-lg font-bold text-sm shadow-md">{t.earnings}</button>
            </>
          )}
          <button onClick={toggleLanguage} className="bg-white/10 px-4 py-2 rounded-full text-sm font-medium border border-white/20">🌐 {t.languageLabel}</button>
          {!isWorker && (
            <>
              <button onClick={() => navigate('/booking-history')} className="bg-indigo-500 px-4 py-2 rounded-lg font-bold text-sm shadow-md">{t.bookingHistory}</button>
              <button onClick={() => navigate('/booking')} className="bg-white text-[#0B3B2C] px-4 py-2 rounded-lg font-bold text-sm shadow-md">{t.newBooking}</button>
            </>
          )}
          <button onClick={handleLogout} className="bg-white/10 px-4 py-2 rounded-lg font-bold text-sm border border-white/20">{t.logout}</button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div><h2 className="text-2xl font-bold text-[#0B3B2C]">🎉 {t.welcome}, {displayName}!</h2><p className="text-sm text-gray-500 mt-1">Logged in as <strong>{isWorker ? t.worker : t.customer}</strong></p></div>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${isWorker ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{isWorker ? 'Worker' : 'Customer'}</span>
        </div>

        {isWorker && workerBookings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-800">📋 Active Jobs ({workerBookings.length})</h2>
            {workerBookings.map(b => (
              <div key={b.id} className="border p-4 rounded-xl mb-3 bg-blue-50 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <p className="font-bold">🧵 {b.yarn} - {b.size} Size</p>
                  <p className="text-sm text-gray-600">💰 ₹{b.price} | ID: {b.id}</p>
                  <span className="text-xs font-bold text-blue-600">{b.status === 'in-progress' ? t.inProgress : t.waitingConfirm}</span>
                </div>
                {b.status === 'in-progress' && (
                  <button onClick={() => handleMarkComplete(b.id)} className="bg-green-500 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-green-600">{t.markComplete}</button>
                )}
                {b.status === 'waiting-confirmation' && (
                  <span className="text-orange-500 font-bold text-sm">⏳ Waiting for customer</span>
                )}
              </div>
            ))}
          </div>
        )}

        {!isWorker && customerPendingConfirm.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-orange-200">
            <h2 className="text-xl font-bold mb-4 text-orange-800">📋 Pending Confirmations ({customerPendingConfirm.length})</h2>
            {customerPendingConfirm.map(b => (
              <div key={b.id} className="border border-orange-300 p-4 rounded-xl mb-3 bg-orange-50 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <p className="font-bold">🧵 {b.yarn} - {b.size} Size</p>
                  <p className="text-sm text-gray-600">💰 ₹{b.price} | ID: {b.id}</p>
                  <p className="text-xs text-orange-600 font-bold">Worker completed the job! Please confirm.</p>
                </div>
                <button onClick={() => handleConfirmComplete(b.id)} className="bg-green-500 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-green-600">{t.confirmComplete}</button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center"><h3 className="font-bold text-gray-700">{t.totalBookings}</h3><p className="text-3xl font-bold text-[#0B3B2C] mt-1">{isWorker ? availableBookings.length : myBookings.length}</p></div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center"><h3 className="font-bold text-gray-700">{t.completed}</h3><p className="text-3xl font-bold text-green-600 mt-1">{isWorker ? 0 : myBookings.filter(b => b.status === 'completed').length}</p></div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center"><h3 className="font-bold text-gray-700">{t.pending}</h3><p className="text-3xl font-bold text-yellow-600 mt-1">{isWorker ? 0 : myBookings.filter(b => b.status === 'pending' || b.status === 'in-progress').length}</p></div>
        </div>

        {isWorker && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-[#0B3B2C]">{t.availableJobs} ({availableBookings.length})</h2>
            {availableBookings.length === 0 ? <p className="text-gray-500 text-center">{t.noJobs}</p> : availableBookings.map(b => (
              <div key={b.id} className="border p-4 rounded-xl mb-3 bg-gray-50 flex justify-between items-center">
                <div><p className="font-bold">🧵 {b.yarn} - {b.size} Size</p><p className="text-sm text-gray-600">💰 ₹{b.price} | ID: {b.id}</p></div>
                <button onClick={() => handleAcceptBooking(b.id)} className="bg-[#0B3B2C] text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-[#1a5c45]">{t.accept}</button>
              </div>
            ))}
          </div>
        )}

        {!isWorker && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-[#0B3B2C]">{t.myBookings} ({myBookings.length})</h2>
            {myBookings.length === 0 ? <p className="text-gray-500 text-center">{t.noMyBookings}</p> : myBookings.map(b => (
              <div key={b.id} className={`border p-4 rounded-xl mb-3 ${b.status === 'completed' ? 'bg-green-50' : 'bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div><p className="font-bold">🧵 {b.yarn} - {b.size} Size</p><p className="text-sm text-gray-600">💰 ₹{b.price} | ID: {b.id}</p></div>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(b.status)}`}>{b.status}</span>
                </div>
                {b.status === 'completed' && b.rating > 0 && <p className="text-yellow-500 text-sm mt-2 font-bold">{'⭐'.repeat(b.rating)}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
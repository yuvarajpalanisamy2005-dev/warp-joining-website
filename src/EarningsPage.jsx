import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkerBookings, checkUser } from './api';

const EarningsPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang) setLanguage(savedLang);
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem('warpSession') || '{}');
      if (!session.user) { setLoading(false); return; }

      const userRes = await checkUser(session.user);

      if (userRes.exists) {
        const userId = userRes.user.id;
        const allBookings = await getWorkerBookings(userId);
        const completed = allBookings.filter(b => b.status === 'completed');
        setCompletedJobs(completed);
        
        const total = completed.reduce((sum, b) => sum + Number(b.price || 0), 0);
        setTotalEarnings(total);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'English' ? 'Tamil' : 'English';
      localStorage.setItem('appLanguage', newLang);
      return newLang;
    });
  };

  const lang = {
    English: {
      title: 'Earnings Dashboard', back: '← Back to Dashboard', totalEarnings: 'Total Earnings',
      completedJobs: 'Completed Jobs', noJobs: 'No completed jobs yet', loading: 'Loading...',
    },
    Tamil: {
      title: 'வருமான டாஷ்போர்டு', back: '← டாஷ்போர்டுக்கு செல்லவும்', totalEarnings: 'மொத்த வருமானம்',
      completedJobs: 'முடிக்கப்பட்ட வேலைகள்', noJobs: 'முடிந்த வேலைகள் இல்லை', loading: 'ஏற்றுகிறது...',
    }
  }[language];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">{lang.loading}</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <header className="bg-[#0B3B2C] text-white shadow-lg py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">🧵 ON - DEMAND WARP JOINING</h1>
          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="bg-white/10 px-4 py-2 rounded-full text-sm font-medium">🌐 {language === 'English' ? 'English / தமிழ்' : 'தமிழ் / English'}</button>
            <button onClick={() => navigate('/dashboard')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition">{lang.back}</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <h2 className="text-3xl font-extrabold text-[#0B3B2C] mb-6">{lang.title}</h2>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center mb-8">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{lang.totalEarnings}</p>
          <p className="text-5xl font-bold text-[#0B3B2C] mt-2">₹{totalEarnings}</p>
          <p className="text-xs text-gray-400 mt-1">{completedJobs.length} jobs completed</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-[#0B3B2C]">{lang.completedJobs} ({completedJobs.length})</h3>
          </div>
          
          {completedJobs.length === 0 ? (
            <div className="p-12 text-center"><p className="text-4xl mb-4">📭</p><p className="text-gray-500">{lang.noJobs}</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {completedJobs.map((job) => (
                <div key={job.id} className="px-6 py-4 flex flex-wrap justify-between items-center gap-2 hover:bg-gray-50 transition">
                  <div>
                    <p className="font-bold text-gray-800">🧵 {job.yarn} - {job.size} Size</p>
                    <p className="text-sm text-gray-500">📋 ID: #{job.id}</p>
                    <p className="text-xs text-gray-400">👤 {job.customer_name || 'Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">₹{job.price}</p>
                    <p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString()}</p>
                    {job.rating > 0 && <p className="text-yellow-500 text-sm">{'⭐'.repeat(job.rating)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EarningsPage;
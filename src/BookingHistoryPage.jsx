import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerBookings, checkUser } from './api';

const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('warpSession') || '{}');
        
        if (session.user) {
          // 1. யூசர் யாரு-னு செக் பண்றோம்
          const userRes = await checkUser(session.user);
          
          if (userRes.exists && userRes.user.user_type === 'customer') {
            // 2. Customer-ஆ இருந்தா மட்டும் புக்கிங் எடுக்கிறோம்
            const res = await getCustomerBookings(userRes.user.contact);
            setBookings(res || []);
          }
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter Logic
  const filteredBookings = filter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status.toLowerCase() === filter.toLowerCase());

  if (loading) {
    return <div className="text-center mt-20 text-xl font-bold text-gray-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-[#0B3B2C] text-white shadow-lg py-4 px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">🧵 ON - DEMAND WARP JOINING</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition">
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6">
        <h2 className="text-3xl font-extrabold text-[#0B3B2C] mb-6">Booking History</h2>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Pending', 'In-progress', 'Waiting-confirmation', 'Completed', 'Cancelled'].map(status => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition border ${
                filter === status ? 'bg-[#0B3B2C] text-white border-[#0B3B2C]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-gray-200">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500 font-medium text-lg">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap justify-between items-center gap-4 hover:shadow-md transition">
                <div>
                  <p className="font-bold text-lg text-gray-800">🧵 {booking.yarn} - Size: {booking.size}</p>
                  <p className="text-sm text-gray-500 mt-1">Booking ID: #{booking.id}</p>
                  <p className="text-sm text-gray-500">Address: {booking.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-700 mb-1">₹{booking.price}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm mt-auto">
        <p>© 2026 Warp Joining Booking. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BookingHistoryPage;
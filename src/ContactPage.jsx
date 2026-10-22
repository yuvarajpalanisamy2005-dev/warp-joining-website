import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang) setLanguage(savedLang);
    
    const savedMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    setMessages(savedMessages);
  }, []);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const newLang = prev === 'English' ? 'Tamil' : 'English';
      localStorage.setItem('appLanguage', newLang);
      return newLang;
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newMessage = {
      id: 'MSG' + Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, newMessage];
    localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    setMessages(updatedMessages);
    
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setSubmitted(false), 5000);
  };

  const t = {
    English: {
      title: 'Contact Us',
      back: '← Back to Home',
      phone: 'Phone',
      phoneNum: '+91 9876543210',
      phoneTime: 'Available 9:00 AM - 9:00 PM',
      email: 'Email',
      emailId: 'support@warpjoining.com',
      emailTime: 'We reply within 24 hours',
      address: 'Address',
      address1: '123, Textile City,',
      address2: 'Coimbatore - 641001',
      addressState: 'Tamil Nadu, India',
      hours: 'Working Hours',
      hours1: 'Monday - Saturday',
      hours2: '9:00 AM - 9:00 PM',
      hours3: 'Sunday - Closed',
      appTitle: 'ON - DEMAND WARP JOINING BOOKING WEBSITE',
      languageLabel: 'English / தமிழ்',
      formTitle: 'Send us a Message',
      nameLabel: 'Your Name',
      namePlaceholder: 'Enter your full name',
      emailLabel: 'Your Email',
      emailPlaceholder: 'Enter your email address',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'What is this about?',
      messageLabel: 'Message',
      messagePlaceholder: 'Write your message here...',
      submitBtn: 'Send Message',
      successMsg: '✅ Your message has been sent! We will get back to you soon.',
    },
    Tamil: {
      title: 'தொடர்பு',
      back: '← முகப்பு',
      phone: 'தொலைபேசி',
      phoneNum: '+91 9876543210',
      phoneTime: 'காலை 9:00 - இரவு 9:00 வரை கிடைக்கும்',
      email: 'மின்னஞ்சல்',
      emailId: 'support@warpjoining.com',
      emailTime: '24 மணி நேரத்திற்குள் பதில் அளிப்போம்',
      address: 'முகவரி',
      address1: '123, துணி நகரம்,',
      address2: 'கோயம்புத்தூர் - 641001',
      addressState: 'தமிழ்நாடு, இந்தியா',
      hours: 'வேலை நேரம்',
      hours1: 'திங்கள் - சனி',
      hours2: 'காலை 9:00 - இரவு 9:00',
      hours3: 'ஞாயிறு - மூடப்பட்டது',
      appTitle: 'பாவு இணைத்தல் பதிவு செய்தல் தளம்',
      languageLabel: 'தமிழ் / English',
      formTitle: 'உங்கள் செய்தியை அனுப்புங்கள்',
      nameLabel: 'உங்கள் பெயர்',
      namePlaceholder: 'உங்கள் முழு பெயரை உள்ளிடவும்',
      emailLabel: 'உங்கள் மின்னஞ்சல்',
      emailPlaceholder: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிடவும்',
      subjectLabel: 'பொருள்',
      subjectPlaceholder: 'இது எதைப் பற்றியது?',
      messageLabel: 'செய்தி',
      messagePlaceholder: 'உங்கள் செய்தியை இங்கே எழுதுங்கள்...',
      submitBtn: 'செய்தி அனுப்பு',
      successMsg: '✅ உங்கள் செய்தி அனுப்பப்பட்டது! நாங்கள் விரைவில் பதிலளிப்போம்.',
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

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full">
        <h2 className="text-4xl font-extrabold text-[#0B3B2C] mb-8 text-center">{lang.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition flex items-start gap-4">
            <div className="text-3xl">📞</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{lang.phone}</h3>
              <p className="text-gray-600 font-semibold">{lang.phoneNum}</p>
              <p className="text-gray-500 text-sm">{lang.phoneTime}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition flex items-start gap-4">
            <div className="text-3xl">✉️</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{lang.email}</h3>
              <p className="text-gray-600 font-semibold">{lang.emailId}</p>
              <p className="text-gray-500 text-sm">{lang.emailTime}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition flex items-start gap-4">
            <div className="text-3xl">📍</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{lang.address}</h3>
              <p className="text-gray-600">{lang.address1}</p>
              <p className="text-gray-600">{lang.address2}</p>
              <p className="text-gray-500 text-sm">{lang.addressState}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition flex items-start gap-4">
            <div className="text-3xl">🕐</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{lang.hours}</h3>
              <p className="text-gray-600">{lang.hours1}</p>
              <p className="text-gray-600">{lang.hours2}</p>
              <p className="text-gray-500 text-sm">{lang.hours3}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-[#0B3B2C] mb-6 text-center">{lang.formTitle}</h3>
          
          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
              {lang.successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">{lang.nameLabel}</label>
              <input
                type="text"
                name="name"
                placeholder={lang.namePlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] transition"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">{lang.emailLabel}</label>
              <input
                type="email"
                name="email"
                placeholder={lang.emailPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] transition"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">{lang.subjectLabel}</label>
              <input
                type="text"
                name="subject"
                placeholder={lang.subjectPlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] transition"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-1">{lang.messageLabel}</label>
              <textarea
                name="message"
                rows="5"
                placeholder={lang.messagePlaceholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] transition resize-none"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0B3B2C] hover:bg-[#1a5c45] text-white font-bold py-3 px-4 rounded-xl shadow-lg text-lg transition"
            >
              {lang.submitBtn}
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-6 text-center text-sm">
        <p>© 2026 Warp Joining Booking. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ContactPage;
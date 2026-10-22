import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ========== FIX: Default Leaflet Icons ==========
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ========== GOOGLE MAPS STYLE: DESTINATION PIN (Red) ==========
const createDestinationIcon = () => {
  const html = `
    <div style="position:relative; text-align:center; font-family:sans-serif;">
      <div style="
        width: 28px;
        height: 28px;
        background: #ea4335;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(234, 67, 53, 0.5);
        border: 3px solid white;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">📍</div>
      </div>
      <div style="
        background: #ea4335;
        color: white;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 8px;
        border-radius: 12px;
        margin-top: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        white-space: nowrap;
      ">DESTINATION</div>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [40, 50], iconAnchor: [20, 40] });
};

// ========== GOOGLE MAPS STYLE: BLUE USER DOT (Pulsing) ==========
const createUserDotIcon = () => {
  const html = `
    <div style="position:relative; width:24px; height:24px;">
      <div style="
        position:absolute; top:0; left:0; width:24px; height:24px;
        background: #1a73e8;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 6px rgba(26, 115, 232, 0.2);
        animation: pulse-dot 1.5s ease-in-out infinite;
      "></div>
      <style>
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0.4); }
          70% { box-shadow: 0 0 0 12px rgba(26, 115, 232, 0); }
          100% { box-shadow: 0 0 0 0 rgba(26, 115, 232, 0); }
        }
      </style>
    </div>
  `;
  return L.divIcon({ html, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
};

// ========== WORKER CAR ICON ==========
const createWorkerIcon = () => {
  const html = `
    <div style="
      background: #0B3B2C;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      font-size: 18px;
    ">🚗</div>
  `;
  return L.divIcon({ html, className: '', iconSize: [36, 36], iconAnchor: [18, 18] });
};

// ========== MAP UPDATER (Smooth FlyTo) ==========
const MapUpdater = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
};

// ========== ZOOM CONTROLS (Google Maps Style) ==========
const ZoomControls = () => {
  const map = useMap();
  return (
    <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-1 shadow-lg rounded-lg overflow-hidden">
      <button 
        onClick={() => map.zoomIn()} 
        className="w-10 h-10 bg-white hover:bg-gray-100 flex items-center justify-center text-xl font-light text-gray-700 transition border-b border-gray-200"
      >
        +
      </button>
      <button 
        onClick={() => map.zoomOut()} 
        className="w-10 h-10 bg-white hover:bg-gray-100 flex items-center justify-center text-xl font-light text-gray-700 transition"
      >
        −
      </button>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const LiveLocationPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');
  const [location, setLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [destination] = useState({ lat: 11.0168, lng: 77.0333, address: '123, Textile City, Coimbatore' });

  const session = JSON.parse(localStorage.getItem('warpSession') || '{}');
  const isWorker = session.userType === 'worker';

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

  // ========== TRACKING LOGIC ==========
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported.');
      return;
    }
    setIsTracking(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        if (isWorker) localStorage.setItem('workerLiveLocation', JSON.stringify(coords));
      },
      (err) => { alert('Error: ' + err.message); setIsTracking(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setIsTracking(false);
    if (isWorker) localStorage.removeItem('workerLiveLocation');
  };

  // Customer reads worker location
  useEffect(() => {
    if (!isWorker) {
      const interval = setInterval(() => {
        const stored = localStorage.getItem('workerLiveLocation');
        if (stored) {
          try { setLocation(JSON.parse(stored)); } catch (e) {}
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isWorker]);

  useEffect(() => {
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [watchId]);

  const defaultPosition = [11.0168, 77.0333];
  const currentPos = location ? [location.lat, location.lng] : defaultPosition;

  // ========== TRANSLATIONS ==========
  const t = {
    English: {
      title: isWorker ? 'Live Location' : 'Tracking Worker',
      statusActive: '🟢 Live',
      statusInactive: '🔴 Offline',
      startBtn: '🚀 Start Tracking',
      stopBtn: '⏹️ Stop Tracking',
      back: '← Back',
      workerLabel: 'Worker',
      youAreHere: 'Your Location',
      eta: '⏱️ ETA',
      distance: '📏 Distance',
      minutes: 'mins',
      languageLabel: 'English / தமிழ்',
      appTitle: 'WARP JOINING',
      destination: '📍 Destination',
      noLocation: 'Waiting for location...',
      destinationLabel: 'Destination',
    },
    Tamil: {
      title: isWorker ? 'நேரடி இருப்பிடம்' : 'தொழிலாளி கண்காணிப்பு',
      statusActive: '🟢 இணைப்பு',
      statusInactive: '🔴 இணைப்பில்லை',
      startBtn: '🚀 கண்காணிப்பைத் தொடங்கு',
      stopBtn: '⏹️ கண்காணிப்பை நிறுத்து',
      back: '← பின்',
      workerLabel: 'தொழிலாளி',
      youAreHere: 'உங்கள் இருப்பிடம்',
      eta: '⏱️ வருகை நேரம்',
      distance: '📏 தூரம்',
      minutes: 'நிமிடங்கள்',
      languageLabel: 'தமிழ் / English',
      appTitle: 'பாவு இணைத்தல்',
      destination: '📍 இலக்கு',
      noLocation: 'இருப்பிடத்திற்காக காத்திருக்கிறது...',
      destinationLabel: 'இலக்கு',
    }
  };

  const lang = t[language];

  return (
    <div className="h-screen w-full relative font-sans bg-gray-900">
      
      {/* ========== FULL SCREEN MAP ========== */}
      <MapContainer 
        center={currentPos} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* DESTINATION MARKER - Google Red Pin */}
        <Marker position={[destination.lat, destination.lng]} icon={createDestinationIcon()}>
          <Popup>{lang.destinationLabel}</Popup>
        </Marker>

        {/* LOCATION MARKER - Blue Dot or Worker Car */}
        {location && (
          <>
            <Marker 
              position={[location.lat, location.lng]} 
              icon={isWorker ? createWorkerIcon() : createUserDotIcon()}
            >
              <Popup>{isWorker ? lang.workerLabel : lang.youAreHere}</Popup>
            </Marker>
            
            {/* ROUTE PATH - Solid Google Blue */}
            <Polyline 
              positions={[
                [location.lat, location.lng],
                [destination.lat, destination.lng]
              ]} 
              color="#1a73e8" 
              weight={4} 
              opacity={0.8}
            />
          </>
        )}

        <MapUpdater position={currentPos} />
        
        {/* ZOOM CONTROLS - Google Style */}
        <ZoomControls />
      </MapContainer>

      {/* ========== TOP HEADER (Minimal) ========== */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <div className="flex justify-between items-center max-w-6xl mx-auto pointer-events-auto">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-white hover:text-emerald-300 transition bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm shadow-lg"
          >
            <span className="text-lg">←</span> {lang.back}
          </button>
          <button 
            onClick={toggleLanguage} 
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-1.5 rounded-full text-white text-xs border border-white/20 transition"
          >
            🌐 {lang.languageLabel}
          </button>
        </div>
      </div>

      {/* ========== RIGHT SIDE PANEL - Google Maps Style ========== */}
      <div className="absolute top-20 right-4 z-20 w-72">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/20">
          
          {/* Title & Status */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 text-sm">{lang.title}</h3>
            <span className={`text-xs font-semibold ${isTracking ? 'text-emerald-600' : 'text-gray-400'}`}>
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isTracking ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {isTracking ? lang.statusActive : lang.statusInactive}
            </span>
          </div>

          {/* Destination Info - Google Style Card */}
          <div className="bg-gray-50 rounded-xl p-2.5 mb-3 border border-gray-100 flex items-start gap-2.5">
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{lang.destinationLabel}</p>
              <p className="text-xs font-semibold text-gray-800 truncate">{destination.address}</p>
              <p className="text-[10px] text-gray-400 font-mono">Lat: {destination.lat}, Lng: {destination.lng}</p>
            </div>
          </div>

          {/* Location Info - Your Location */}
          <div className="bg-blue-50 rounded-xl p-2.5 mb-3 border border-blue-100 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
              {isWorker ? '🚗' : '📍'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                {isWorker ? lang.workerLabel : lang.youAreHere}
              </p>
              <p className="text-xs text-gray-700 truncate">
                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : lang.noLocation}
              </p>
            </div>
            {isTracking && (
              <div className="bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 flex-shrink-0">
                LIVE
              </div>
            )}
          </div>

          {/* Stats - Distance & ETA */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
              <p className="text-[10px] text-gray-500 font-medium">{lang.distance}</p>
              <p className="text-sm font-bold text-blue-600">~3.2 km</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center border border-purple-100">
              <p className="text-[10px] text-gray-500 font-medium">{lang.eta}</p>
              <p className="text-sm font-bold text-purple-600">~8 {lang.minutes}</p>
            </div>
          </div>

          {/* Action Button */}
          {isWorker ? (
            <button
              onClick={isTracking ? stopTracking : startTracking}
              className={`w-full py-2.5 rounded-xl font-bold text-white text-sm transition shadow-md flex items-center justify-center gap-2 ${
                isTracking 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                  : 'bg-[#0B3B2C] hover:bg-[#1a5c45] shadow-emerald-500/30'
              }`}
            >
              {isTracking ? lang.stopBtn : lang.startBtn}
            </button>
          ) : (
            <div className="text-center text-[11px] text-gray-500 py-2 bg-yellow-50 rounded-xl border border-yellow-200">
              {!location ? '⏳ Waiting for worker...' : '📍 Tracking worker in real-time'}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default LiveLocationPage;
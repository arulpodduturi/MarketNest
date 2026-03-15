import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, Bell, BarChart3, Layers, X } from 'lucide-react';
import SearchBar from './SearchBar';
import ProfileDropdown from './ProfileDropdown';

// Demo F&O notifications — frontend-driven mock data
const fnoNotifications = [
  { id: 1, title: 'Unusual OI Activity', message: 'NIFTY 24500 CE saw 12L OI addition in last 30 mins', time: '2 min ago', type: 'alert' },
  { id: 2, title: 'New Expiry Data Loaded', message: 'Weekly expiry data for 13-Mar-2026 is now available', time: '5 min ago', type: 'info' },
  { id: 3, title: 'PCR Shift Detected', message: 'NIFTY PCR moved from 0.85 to 1.12 — Bullish signal', time: '12 min ago', type: 'bullish' },
  { id: 4, title: 'Max Pain Update', message: 'NIFTY Max Pain shifted to 24,400 from 24,350', time: '18 min ago', type: 'info' },
  { id: 5, title: 'High IV Alert', message: 'BANKNIFTY ATM IV spiked to 18.5% — above 1σ', time: '25 min ago', type: 'alert' },
];

const Topbar = ({ onRefresh }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [fnoNotifShown, setFnoNotifShown] = useState(false);
  const [toastNotif, setToastNotif] = useState(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const isFNO = location.pathname === '/fno';
  // Stocks module = everything that is not the F&O page
  const isStocks = !isFNO;

  // Show toast notification when entering F&O section
  useEffect(() => {
    if (isFNO && !fnoNotifShown) {
      setToastNotif(fnoNotifications[0]);
      setFnoNotifShown(true);
      const timer = setTimeout(() => setToastNotif(null), 5000);
      return () => clearTimeout(timer);
    }
    if (!isFNO) {
      setFnoNotifShown(false);
    }
  }, [isFNO, fnoNotifShown]);

  // Click outside to close dropdowns + Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* === Module Tabs: Stocks / F&O === */}
          <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1 flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                isStocks
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Stocks
            </button>
            <button
              onClick={() => navigate('/fno')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                isFNO
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              F&O
            </button>
          </div>

          {/* Search */}
          <SearchBar />

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onRefresh}
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {isFNO && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">Notifications</h4>
                    <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded-full font-medium">
                      {fnoNotifications.length} new
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-dark-800">
                    {fnoNotifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 hover:bg-dark-800/50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.type === 'alert' ? 'bg-red-400' :
                            n.type === 'bullish' ? 'bg-emerald-400' : 'bg-primary-400'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            <p className="text-xs text-dark-400 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-dark-500 mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-dark-700 text-center">
                    <button className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white hover:ring-2 hover:ring-primary-400/30 transition-all cursor-pointer"
                title="Profile"
              >
                AP
              </button>
              {showProfile && <ProfileDropdown onClose={() => setShowProfile(false)} />}
            </div>
          </div>
        </div>
      </header>

      {/* F&O Toast Notification — appears when entering F&O section */}
      {toastNotif && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in-slide">
          <div className="bg-dark-900 border border-dark-700 rounded-xl shadow-2xl p-4 w-80">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{toastNotif.title}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{toastNotif.message}</p>
                </div>
              </div>
              <button onClick={() => setToastNotif(null)} className="p-1 text-dark-500 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;

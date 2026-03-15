import { User, Settings, HelpCircle, LogOut, CreditCard, Shield, BookOpen, Bell } from 'lucide-react';

// Mock user data — replace with real auth/user data when available
const mockUser = {
  name: 'Arul Podduturi',
  email: 'arul@marketnest.in',
  initials: 'AP',
  plan: 'Premium',
  clientId: 'MN-284710',
};

const menuItems = [
  { icon: User, label: 'My Profile', description: 'Account details & KYC' },
  { icon: CreditCard, label: 'Portfolio', description: 'Holdings & P&L' },
  { icon: BookOpen, label: 'Trade Book', description: 'Order history' },
  { icon: Bell, label: 'Alerts', description: 'Price & OI alerts' },
  { icon: Shield, label: 'Security', description: '2FA & passwords' },
  { icon: Settings, label: 'Settings', description: 'Preferences & display' },
  { icon: HelpCircle, label: 'Help & Support', description: 'FAQs & tickets' },
];

const ProfileDropdown = ({ onClose }) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden z-50">
      {/* User Info Header */}
      <div className="px-4 py-4 border-b border-dark-700 bg-dark-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-sm font-bold text-white">
            {mockUser.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{mockUser.name}</p>
            <p className="text-xs text-dark-400 truncate">{mockUser.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
            {mockUser.plan}
          </span>
          <span className="text-[10px] text-dark-500">
            Client ID: {mockUser.clientId}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-800/70 transition-colors text-left"
            onClick={onClose}
          >
            <item.icon className="w-4 h-4 text-dark-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-white">{item.label}</p>
              <p className="text-[10px] text-dark-500">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <div className="border-t border-dark-700 p-2">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left"
          onClick={onClose}
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400 font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;

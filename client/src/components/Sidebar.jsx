import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Star,
  LineChart,
  TrendingUp,
  Layers,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/charts', label: 'Charts', icon: LineChart },
  { to: '/fno', label: 'F&O', icon: Layers },
];

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900 border-r border-dark-700 flex flex-col z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-700">
        <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">MarketNest</h1>
          <p className="text-[11px] text-dark-400 font-medium -mt-0.5">Indian Stock Market</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/15 text-primary-400 border border-primary-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-dark-700">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-dark-400">Market Open — NSE</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

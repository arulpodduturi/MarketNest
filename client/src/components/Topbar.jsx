import { RefreshCw, Bell } from 'lucide-react';
import SearchBar from './SearchBar';

const Topbar = ({ onRefresh }) => {
  return (
    <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <SearchBar />

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
          </button>
          <div className="ml-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white">
            MN
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

import { useNavigate } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';

const WatchlistPanel = ({ watchlist = [], onRemove }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-700">
        <Star className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">Watchlist</h3>
        <span className="ml-auto text-xs text-dark-500 bg-dark-800 px-2 py-0.5 rounded-full">
          {watchlist.length}
        </span>
      </div>
      <div className="divide-y divide-dark-800 max-h-[300px] overflow-y-auto">
        {watchlist.length === 0 && (
          <div className="px-5 py-8 text-center">
            <Star className="w-8 h-8 text-dark-700 mx-auto mb-2" />
            <p className="text-sm text-dark-500">No stocks in watchlist</p>
            <p className="text-xs text-dark-600 mt-1">Add stocks from the dashboard</p>
          </div>
        )}
        {watchlist.map((item) => {
          const isPositive = item.change >= 0;
          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between px-5 py-3 hover:bg-dark-800/50 transition-colors"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/stock/${item.symbol}`)}
              >
                <p className="text-sm font-semibold text-primary-400">{item.symbol}</p>
                <p className="text-xs text-dark-500 truncate max-w-[120px]">{item.companyName}</p>
              </div>
              <div className="text-right mr-3">
                <p className="text-sm font-mono font-medium text-white">
                  {item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-xs font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{item.changePercent?.toFixed(2)}%
                </p>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(item.symbol)}
                  className="p-1.5 rounded-md text-dark-500 hover:text-red-400 hover:bg-dark-800 transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WatchlistPanel;

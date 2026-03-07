import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { fetchWatchlist, removeFromWatchlist } from '../api/watchlistApi';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const res = await fetchWatchlist();
      setWatchlist(res.data || []);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Watchlist</h2>
          <p className="text-sm text-dark-400 mt-0.5">
            {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-12 text-center">
          <Star className="w-12 h-12 text-dark-700 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-dark-400 mb-1">No stocks in your watchlist</h3>
          <p className="text-sm text-dark-500 mb-4">
            Add stocks from the dashboard or stock details page
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-dark-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Symbol</th>
                <th className="text-left px-5 py-3 font-semibold">Company</th>
                <th className="text-right px-5 py-3 font-semibold">Price</th>
                <th className="text-right px-5 py-3 font-semibold">Change</th>
                <th className="text-right px-5 py-3 font-semibold">% Change</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => {
                const isPositive = item.change >= 0;
                return (
                  <tr key={item.symbol} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                    <td
                      className="px-5 py-3 cursor-pointer"
                      onClick={() => navigate(`/stock/${item.symbol}`)}
                    >
                      <span className="font-semibold text-primary-400">{item.symbol}</span>
                    </td>
                    <td className="px-5 py-3 text-dark-300">{item.companyName}</td>
                    <td className="px-5 py-3 text-right font-mono font-medium text-white">
                      ₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      <span className="flex items-center justify-end gap-1">
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{item.change?.toFixed(2)}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-right font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{item.changePercent?.toFixed(2)}%
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleRemove(item.symbol)}
                        className="p-2 rounded-lg text-dark-500 hover:text-red-400 hover:bg-dark-800 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Watchlist;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { fetchStockBySymbol } from '../api/stockApi';
import { addToWatchlist } from '../api/watchlistApi';

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchStockBySymbol(symbol);
        setStock(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Stock not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [symbol]);

  const handleAddToWatchlist = async () => {
    if (!stock) return;
    try {
      await addToWatchlist({
        symbol: stock.symbol,
        companyName: stock.companyName,
        price: stock.ltp,
        change: stock.change,
        changePercent: stock.changePercent,
      });
      setAdded(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setAdded(true);
      } else {
        console.error('Failed to add to watchlist:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-lg text-dark-400">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-dark-400 hover:text-white flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Stock Header */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{stock.symbol}</h1>
              <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded-full font-medium">
                {stock.sector}
              </span>
            </div>
            <p className="text-sm text-dark-400">{stock.companyName}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold text-white font-mono">
                ₹{stock.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center justify-end gap-1.5 mt-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{stock.change?.toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{stock.changePercent?.toFixed(2)}%)</span>
              </div>
            </div>
            <button
              onClick={handleAddToWatchlist}
              disabled={added}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                added
                  ? 'bg-yellow-500/20 text-yellow-400 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${added ? 'fill-yellow-400' : ''}`} />
              {added ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: stock.open },
          { label: 'High', value: stock.high },
          { label: 'Low', value: stock.low },
          { label: 'Prev Close', value: stock.prevClose },
        ].map((item) => (
          <div key={item.label} className="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1">{item.label}</p>
            <p className="text-lg font-bold font-mono text-white">
              ₹{item.value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1">Volume</p>
          <p className="text-lg font-bold font-mono text-white">
            {stock.volume?.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <p className="text-xs text-dark-500 font-medium uppercase tracking-wider mb-1">Sector</p>
          <p className="text-lg font-bold text-white">{stock.sector}</p>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-dark-400" />
          <h3 className="text-sm font-semibold text-white">Price Chart</h3>
        </div>
        {/* Future: Integrate real chart library (TradingView, Recharts, etc.) */}
        <div className="h-64 bg-dark-800 rounded-lg flex items-center justify-center border border-dark-700">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-dark-600 mx-auto mb-2" />
            <p className="text-sm text-dark-500">Chart will be available when real data is integrated</p>
            <p className="text-xs text-dark-600 mt-1">Yahoo Finance / TradingView integration coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetails;

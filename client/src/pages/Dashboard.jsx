import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Star, Activity } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import StockTable from '../components/StockTable';
import GainersList from '../components/GainersList';
import LosersList from '../components/LosersList';
import WatchlistPanel from '../components/WatchlistPanel';
import { fetchAllStocks, fetchMarketIndices, fetchTopGainers, fetchTopLosers } from '../api/stockApi';
import { fetchWatchlist, removeFromWatchlist } from '../api/watchlistApi';

const Dashboard = ({ refreshKey }) => {
  const [stocks, setStocks] = useState([]);
  const [indices, setIndices] = useState([]);
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [stocksRes, indicesRes, gainersRes, losersRes, watchlistRes] = await Promise.all([
        fetchAllStocks(),
        fetchMarketIndices(),
        fetchTopGainers(),
        fetchTopLosers(),
        fetchWatchlist(),
      ]);
      setStocks(stocksRes.data || []);
      setIndices(indicesRes.data || []);
      setGainers(gainersRes.data || []);
      setLosers(losersRes.data || []);
      setWatchlist(watchlistRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-dark-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((idx) => (
          <SummaryCard
            key={idx.symbol}
            title={idx.name}
            value={idx.value}
            change={idx.change}
            changePercent={idx.changePercent}
            icon={Activity}
          />
        ))}
        <SummaryCard
          title="Watchlist"
          value={watchlist.length}
          icon={Star}
        />
      </div>

      {/* Gainers & Losers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GainersList gainers={gainers} />
        <LosersList losers={losers} />
        <WatchlistPanel watchlist={watchlist} onRemove={handleRemoveFromWatchlist} />
      </div>

      {/* Stock Table */}
      <StockTable stocks={stocks} />
    </div>
  );
};

export default Dashboard;

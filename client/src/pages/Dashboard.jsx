import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Star, Activity, Clock, Zap } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import StockTable from '../components/StockTable';
import GainersList from '../components/GainersList';
import LosersList from '../components/LosersList';
import WatchlistPanel from '../components/WatchlistPanel';
import SectorPerformance from '../components/SectorPerformance';
import MarketBreadth from '../components/MarketBreadth';
import { fetchAllStocks, fetchMarketIndices, fetchTopGainers, fetchTopLosers } from '../api/stockApi';
import { fetchWatchlist, removeFromWatchlist } from '../api/watchlistApi';

// Mock 52-week high/low data — replace with live API later
const mock52WHigh = [
  { symbol: 'BAJFINANCE', companyName: 'Bajaj Finance Ltd.', ltp: 7234.50, high52: 7300, changePercent: 1.38 },
  { symbol: 'RELIANCE', companyName: 'Reliance Industries', ltp: 2467.55, high52: 2500, changePercent: 1.32 },
  { symbol: 'SBIN', companyName: 'State Bank of India', ltp: 622.85, high52: 630, changePercent: 1.49 },
];
const mock52WLow = [
  { symbol: 'LT', companyName: 'Larsen & Toubro', ltp: 3215.60, low52: 3180, changePercent: -1.39 },
  { symbol: 'ADANIPORTS', companyName: 'Adani Ports & SEZ', ltp: 852.30, low52: 840, changePercent: -1.46 },
];

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
      const [stocksRes, indicesRes, gainersRes, losersRes, watchlistRes] = await Promise.allSettled([
        fetchAllStocks(),
        fetchMarketIndices(),
        fetchTopGainers(),
        fetchTopLosers(),
        fetchWatchlist(),
      ]);
      setStocks(stocksRes.status === 'fulfilled' ? stocksRes.value.data || [] : []);
      setIndices(indicesRes.status === 'fulfilled' ? indicesRes.value.data || [] : []);
      setGainers(gainersRes.status === 'fulfilled' ? gainersRes.value.data || [] : []);
      setLosers(losersRes.status === 'fulfilled' ? losersRes.value.data || [] : []);
      setWatchlist(watchlistRes.status === 'fulfilled' ? watchlistRes.value.data || [] : []);
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Stocks Dashboard</h2>
          <p className="text-sm text-dark-400 mt-0.5">Market overview and stock performance</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: {new Date().toLocaleTimeString('en-IN')}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          <span className="text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* Summary Index Cards */}
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

      {/* Sector Performance Heatmap */}
      <SectorPerformance />

      {/* Gainers, Losers & Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GainersList gainers={gainers} />
        <LosersList losers={losers} />
        <WatchlistPanel watchlist={watchlist} onRemove={handleRemoveFromWatchlist} />
      </div>

      {/* Market Breadth + 52 Week Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MarketBreadth />

        {/* 52 Week Highs */}
        <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-700">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Near 52W High</h3>
          </div>
          <div className="divide-y divide-dark-800">
            {mock52WHigh.map((s) => (
              <div key={s.symbol} className="flex items-center justify-between px-5 py-3 hover:bg-dark-800/50 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-white">{s.symbol}</p>
                  <p className="text-xs text-dark-500 truncate max-w-[120px]">{s.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium text-white">
                    ₹{s.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-dark-500">52W: ₹{s.high52.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 52 Week Lows */}
        <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-700">
            <Zap className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Near 52W Low</h3>
          </div>
          <div className="divide-y divide-dark-800">
            {mock52WLow.map((s) => (
              <div key={s.symbol} className="flex items-center justify-between px-5 py-3 hover:bg-dark-800/50 transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-semibold text-white">{s.symbol}</p>
                  <p className="text-xs text-dark-500 truncate max-w-[120px]">{s.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium text-white">
                    ₹{s.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-dark-500">52W: ₹{s.low52.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <StockTable stocks={stocks} />
    </div>
  );
};

export default Dashboard;

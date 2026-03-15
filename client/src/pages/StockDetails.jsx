import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
  IndianRupee,
  Calendar,
  Percent,
  BookOpen,
  Activity,
  Hash,
  Scale,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { fetchStockBySymbol } from '../api/stockApi';
import { addToWatchlist } from '../api/watchlistApi';

// Mock extended fundamentals — replace with Yahoo Finance / NSE API later
const mockFundamentals = {
  RELIANCE: { marketCap: '16,72,450 Cr', pe: 28.4, eps: 86.88, bookValue: 1145.20, faceValue: 10, dividendYield: 0.36, beta: 0.82, high52: 2856.15, low52: 2180.00, deliveryPct: 42.8, avgVolume: 9200000, industry: 'Oil & Gas / Conglomerate', description: 'Reliance Industries Limited is an Indian multinational conglomerate, headquartered in Mumbai. It has diverse businesses across energy, petrochemicals, natural gas, retail, telecommunications, mass media, and textiles.' },
  TCS: { marketCap: '13,10,200 Cr', pe: 32.1, eps: 112.54, bookValue: 285.40, faceValue: 1, dividendYield: 1.18, beta: 0.55, high52: 4045.50, low52: 3056.80, deliveryPct: 55.2, avgVolume: 3800000, industry: 'Information Technology', description: 'Tata Consultancy Services is an Indian multinational IT services and consulting company headquartered in Mumbai. It is part of the Tata Group and operates in 150 locations across 46 countries.' },
  INFY: { marketCap: '6,42,300 Cr', pe: 27.8, eps: 55.69, bookValue: 198.60, faceValue: 5, dividendYield: 2.15, beta: 0.68, high52: 1953.90, low52: 1280.45, deliveryPct: 48.5, avgVolume: 7100000, industry: 'Information Technology', description: 'Infosys Limited is an Indian multinational corporation that provides business consulting, information technology, and outsourcing services. Headquartered in Bangalore, Infosys is the second-largest Indian IT company.' },
  HDFCBANK: { marketCap: '12,56,800 Cr', pe: 19.2, eps: 86.06, bookValue: 542.30, faceValue: 1, dividendYield: 1.15, beta: 0.92, high52: 1794.00, low52: 1363.55, deliveryPct: 52.1, avgVolume: 10500000, industry: 'Private Banking', description: 'HDFC Bank Limited is an Indian banking and financial services company headquartered in Mumbai. It is the largest private sector bank in India by assets and the largest bank in India by market capitalisation.' },
  ICICIBANK: { marketCap: '7,38,400 Cr', pe: 17.5, eps: 60.21, bookValue: 312.80, faceValue: 2, dividendYield: 0.76, beta: 1.05, high52: 1268.45, low52: 868.90, deliveryPct: 45.3, avgVolume: 8200000, industry: 'Private Banking', description: 'ICICI Bank Limited is an Indian multinational bank and financial services company headquartered in Mumbai with its registered office in Vadodara. It offers a wide range of banking products and financial services.' },
  SBIN: { marketCap: '5,55,600 Cr', pe: 9.8, eps: 63.56, bookValue: 410.20, faceValue: 1, dividendYield: 1.78, beta: 1.18, high52: 712.00, low52: 498.50, deliveryPct: 38.7, avgVolume: 16800000, industry: 'Public Banking', description: 'State Bank of India is an Indian multinational public sector bank and financial services statutory body headquartered in Mumbai. It is the largest bank in India by number of branches, deposits, and employees.' },
  LT: { marketCap: '4,42,200 Cr', pe: 33.6, eps: 95.70, bookValue: 625.40, faceValue: 2, dividendYield: 0.84, beta: 1.12, high52: 3850.00, low52: 2850.10, deliveryPct: 51.4, avgVolume: 2500000, industry: 'Infrastructure / Engineering', description: 'Larsen & Toubro Limited is an Indian multinational engaged in EPC projects, hi-tech manufacturing, and services. It operates in over 50 countries worldwide.' },
  AXISBANK: { marketCap: '3,40,100 Cr', pe: 14.2, eps: 77.64, bookValue: 485.30, faceValue: 2, dividendYield: 0.09, beta: 1.22, high52: 1340.00, low52: 895.15, deliveryPct: 41.6, avgVolume: 6200000, industry: 'Private Banking', description: 'Axis Bank Limited is the third largest private sector bank in India. The bank offers the entire spectrum of financial services to customer segments covering Large and Mid-Corporates, SME, and Retail Businesses.' },
  ADANIPORTS: { marketCap: '1,84,200 Cr', pe: 35.8, eps: 23.81, bookValue: 198.60, faceValue: 2, dividendYield: 0.59, beta: 1.45, high52: 1560.00, low52: 698.20, deliveryPct: 36.2, avgVolume: 4800000, industry: 'Ports / Infrastructure', description: 'Adani Ports and Special Economic Zone Limited is the largest commercial port operator in India. It is a part of the Adani Group and develops, operates, and maintains port infrastructure.' },
  BAJFINANCE: { marketCap: '4,48,500 Cr', pe: 38.2, eps: 189.38, bookValue: 1420.50, faceValue: 2, dividendYield: 0.28, beta: 1.35, high52: 8192.00, low52: 5875.60, deliveryPct: 44.8, avgVolume: 2100000, industry: 'NBFC / Finance', description: 'Bajaj Finance Limited is an Indian non-banking financial company based in Pune. It is a subsidiary of Bajaj Finserv and focuses on lending and allied activities.' },
};

// Generate mock intraday price data based on stock values
function generateStockChartData(stock) {
  if (!stock) return [];
  const data = [];
  const base = stock.prevClose || stock.ltp || 100;
  const low = stock.low || base * 0.98;
  const high = stock.high || base * 1.02;
  const current = stock.ltp || base;
  const points = 78; // ~6.5 hrs of 5-min candles
  let seed = (stock.symbol || 'X').charCodeAt(0) * 137;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed % 10000) / 10000; };

  let price = stock.open || base;
  for (let i = 0; i < points; i++) {
    const hour = 9 + Math.floor((i * 5) / 60);
    const min = (15 + (i * 5)) % 60;
    const label = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

    // Drift price toward current LTP
    const target = i < points - 1 ? base + ((current - base) * (i / points)) : current;
    price = price + (rand() - 0.48) * (high - low) * 0.08 + (target - price) * 0.05;
    price = Math.max(low * 0.998, Math.min(high * 1.002, price));
    if (i === points - 1) price = current;

    data.push({ label, price: Math.round(price * 100) / 100 });
  }
  return data;
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] text-dark-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">
        ₹{payload[0].value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

const StockDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [watchlistMsg, setWatchlistMsg] = useState(null);

  const chartData = useMemo(() => generateStockChartData(stock), [stock]);
  const isPositive = stock ? stock.change >= 0 : true;
  const chartColor = isPositive ? '#34d399' : '#f87171';
  const chartGradient = isPositive ? '#10b981' : '#ef4444';

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
    setWatchlistMsg(null);
    try {
      await addToWatchlist({
        symbol: stock.symbol,
        companyName: stock.companyName,
        price: stock.ltp,
        change: stock.change,
        changePercent: stock.changePercent,
      });
      setAdded(true);
      setWatchlistMsg({ type: 'success', text: `${stock.symbol} added to watchlist` });
    } catch (err) {
      if (err.response?.status === 409) {
        setAdded(true);
        setWatchlistMsg({ type: 'info', text: `${stock.symbol} is already in your watchlist` });
      } else {
        const msg = err.response?.data?.message || 'Failed to add to watchlist';
        setWatchlistMsg({ type: 'error', text: msg });
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

  // Get extended fundamentals for this stock (mock data)
  const fundamentals = mockFundamentals[stock.symbol] || null;

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
              {fundamentals && (
                <span className="text-xs bg-dark-800 text-dark-400 px-2 py-0.5 rounded-full font-medium">
                  {fundamentals.industry}
                </span>
              )}
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
        {watchlistMsg && (
          <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
            watchlistMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            watchlistMsg.type === 'info' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {watchlistMsg.text}
          </div>
        )}
      </div>

      {/* Price & Volume Stats — Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: stock.open, icon: Activity },
          { label: 'High', value: stock.high, icon: TrendingUp },
          { label: 'Low', value: stock.low, icon: TrendingDown },
          { label: 'Prev Close', value: stock.prevClose, icon: Calendar },
        ].map((item) => (
          <div key={item.label} className="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">{item.label}</p>
              <item.icon className="w-3.5 h-3.5 text-dark-600" />
            </div>
            <p className="text-lg font-bold font-mono text-white">
              ₹{item.value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Volume, Sector, Market Cap — Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">Volume</p>
            <BarChart3 className="w-3.5 h-3.5 text-dark-600" />
          </div>
          <p className="text-lg font-bold font-mono text-white">
            {stock.volume?.toLocaleString('en-IN')}
          </p>
          {fundamentals && (
            <p className="text-[10px] text-dark-500 mt-0.5">Avg: {fundamentals.avgVolume?.toLocaleString('en-IN')}</p>
          )}
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">Sector</p>
            <Building2 className="w-3.5 h-3.5 text-dark-600" />
          </div>
          <p className="text-lg font-bold text-white">{stock.sector}</p>
        </div>
        {fundamentals && (
          <>
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">Market Cap</p>
                <IndianRupee className="w-3.5 h-3.5 text-dark-600" />
              </div>
              <p className="text-lg font-bold text-white font-mono">₹{fundamentals.marketCap}</p>
            </div>
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">Delivery %</p>
                <Percent className="w-3.5 h-3.5 text-dark-600" />
              </div>
              <p className="text-lg font-bold text-white font-mono">{fundamentals.deliveryPct}%</p>
            </div>
          </>
        )}
      </div>

      {/* 52 Week High/Low Range */}
      {fundamentals && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">52 Week Range</h3>
          <div className="flex items-center gap-4">
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-dark-500 uppercase font-medium">Low</p>
              <p className="text-sm font-bold font-mono text-red-400">
                ₹{fundamentals.low52?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex-1 relative">
              <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
              {/* Current price indicator */}
              <div
                className="absolute top-0 -mt-1 w-0.5 h-4 bg-white rounded-full"
                style={{
                  left: `${Math.min(Math.max(((stock.ltp - fundamentals.low52) / (fundamentals.high52 - fundamentals.low52)) * 100, 0), 100)}%`,
                }}
                title={`Current: ₹${stock.ltp}`}
              />
              <div className="flex justify-between text-[10px] text-dark-500 mt-2">
                <span>52W Low</span>
                <span className="text-white font-medium">
                  Current: ₹{stock.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span>52W High</span>
              </div>
            </div>
            <div className="text-left flex-shrink-0">
              <p className="text-xs text-dark-500 uppercase font-medium">High</p>
              <p className="text-sm font-bold font-mono text-emerald-400">
                ₹{fundamentals.high52?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fundamentals Grid */}
      {fundamentals && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { label: 'P/E Ratio', value: fundamentals.pe?.toFixed(1), icon: Scale },
            { label: 'EPS (₹)', value: `₹${fundamentals.eps?.toFixed(2)}`, icon: IndianRupee },
            { label: 'Book Value', value: `₹${fundamentals.bookValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: BookOpen },
            { label: 'Face Value', value: `₹${fundamentals.faceValue}`, icon: Hash },
            { label: 'Div Yield', value: `${fundamentals.dividendYield?.toFixed(2)}%`, icon: Percent },
            { label: 'Beta', value: fundamentals.beta?.toFixed(2), icon: Activity },
          ].map((item) => (
            <div key={item.label} className="bg-dark-900 border border-dark-700 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-wider">{item.label}</p>
                <item.icon className="w-3 h-3 text-dark-600" />
              </div>
              <p className="text-sm font-bold text-white font-mono">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Price Chart */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Price Chart — Intraday</h3>
          </div>
          <span className="text-[11px] text-dark-500">Mock Data · 5 min interval</span>
        </div>
        <div className="h-80 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartGradient} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={chartGradient} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.toLocaleString('en-IN')}
                width={60}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#stockGradient)"
                dot={false}
                activeDot={{ r: 4, fill: chartColor, stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* About Company */}
      {fundamentals?.description && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">About {stock.companyName}</h3>
          </div>
          <p className="text-sm text-dark-400 leading-relaxed">{fundamentals.description}</p>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-700 text-xs text-dark-500">
            <span>Sector: <span className="text-dark-300">{stock.sector}</span></span>
            <span>Industry: <span className="text-dark-300">{fundamentals.industry}</span></span>
            <span>Exchange: <span className="text-dark-300">NSE</span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails;

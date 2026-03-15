import { useState, useMemo } from 'react';
import { BarChart3, Clock, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

// --- Generate mock NIFTY price data for each timeframe ---
function generateMockData(tf) {
  const now = Date.now();
  const configs = {
    '1D': { points: 75, intervalMs: 5 * 60 * 1000, base: 24450, volatility: 40 },
    '1W': { points: 35, intervalMs: 4 * 60 * 60 * 1000, base: 24200, volatility: 80 },
    '1M': { points: 22, intervalMs: 24 * 60 * 60 * 1000, base: 23800, volatility: 150 },
    '3M': { points: 65, intervalMs: 24 * 60 * 60 * 1000, base: 23000, volatility: 300 },
    '6M': { points: 130, intervalMs: 24 * 60 * 60 * 1000, base: 22500, volatility: 600 },
    '1Y': { points: 250, intervalMs: 24 * 60 * 60 * 1000, base: 21000, volatility: 1200 },
    '5Y': { points: 260, intervalMs: 7 * 24 * 60 * 60 * 1000, base: 14000, volatility: 4000 },
  };
  const { points, intervalMs, base, volatility } = configs[tf];
  const data = [];
  let price = base;
  // Seed-based pseudo-random so data is stable per timeframe
  let seed = tf.charCodeAt(0) * 1000 + tf.charCodeAt(1);
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed % 10000) / 10000; };

  for (let i = 0; i < points; i++) {
    const t = now - (points - i) * intervalMs;
    const drift = (volatility / points) * (i / points);
    price = price + (rand() - 0.48) * (volatility / Math.sqrt(points)) + drift * 0.1;
    price = Math.max(price, base * 0.85);

    const date = new Date(t);
    let label;
    if (tf === '1D') {
      label = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (tf === '1W' || tf === '1M') {
      label = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } else {
      label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }

    data.push({
      label,
      price: Math.round(price * 100) / 100,
      volume: Math.round((rand() * 8 + 2) * 1000000),
    });
  }
  return data;
}

// --- Custom Tooltip ---
const PriceTooltip = ({ active, payload, label }) => {
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

const VolumeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] text-dark-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">
        Vol: {(payload[0].value / 1000000).toFixed(2)}M
      </p>
    </div>
  );
};

const Charts = () => {
  const [activeTF, setActiveTF] = useState('1M');

  const data = useMemo(() => generateMockData(activeTF), [activeTF]);

  const priceChange = data.length >= 2 ? data[data.length - 1].price - data[0].price : 0;
  const isPositive = priceChange >= 0;
  const gradientColor = isPositive ? '#10b981' : '#ef4444';
  const strokeColor = isPositive ? '#34d399' : '#f87171';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Charts</h2>
        <p className="text-sm text-dark-400 mt-0.5">Technical analysis and price charts</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Stock Selector Placeholder */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-white hover:border-dark-600 transition-colors">
            NIFTY 50
            <ChevronDown className="w-4 h-4 text-dark-400" />
          </button>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex items-center bg-dark-900 border border-dark-700 rounded-lg p-0.5">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTF(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTF === tf
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Price summary */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-lg font-bold text-white font-mono">
            ₹{data[data.length - 1]?.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Price Chart */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Price Chart — NIFTY 50</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-dark-500">
            <Clock className="w-3 h-3" />
            {activeTF} · Mock Data
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.toLocaleString('en-IN')}
                width={65}
              />
              <Tooltip content={<PriceTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: strokeColor, stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-dark-400" />
          <h3 className="text-sm font-semibold text-white">Volume</h3>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                width={45}
              />
              <Tooltip content={<VolumeTooltip />} />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.6} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;

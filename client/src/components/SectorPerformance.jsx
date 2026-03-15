import { TrendingUp, TrendingDown } from 'lucide-react';

// Mock sector data — replace with live NSE sector indices API later
const sectors = [
  { name: 'NIFTY IT', change: 1.45, value: 38250.30 },
  { name: 'NIFTY Bank', change: -0.68, value: 51320.15 },
  { name: 'NIFTY Pharma', change: 0.92, value: 19850.60 },
  { name: 'NIFTY Auto', change: -1.12, value: 24100.80 },
  { name: 'NIFTY Metal', change: 2.34, value: 8940.25 },
  { name: 'NIFTY FMCG', change: 0.31, value: 56780.40 },
  { name: 'NIFTY Energy', change: -0.45, value: 37200.70 },
  { name: 'NIFTY Realty', change: 1.87, value: 1045.55 },
  { name: 'NIFTY Infra', change: 0.62, value: 6820.90 },
  { name: 'NIFTY PSE', change: -0.23, value: 9415.10 },
];

const SectorPerformance = () => {
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
        <h3 className="text-sm font-semibold text-white">Sector Performance</h3>
        <span className="text-[10px] text-dark-500 uppercase tracking-wider font-medium">Today</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-dark-800">
        {sectors.map((sector) => {
          const isPositive = sector.change >= 0;
          return (
            <div
              key={sector.name}
              className="px-3 py-3 hover:bg-dark-800/40 transition-colors cursor-pointer border-b border-dark-800"
            >
              <p className="text-xs text-dark-400 font-medium truncate">{sector.name}</p>
              <p className="text-sm font-bold text-white mt-1">
                {sector.value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
              <div className={`flex items-center gap-1 mt-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{sector.change.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectorPerformance;

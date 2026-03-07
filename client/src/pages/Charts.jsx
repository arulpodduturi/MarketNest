import { BarChart3, Clock, ChevronDown } from 'lucide-react';

const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];

const Charts = () => {
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
          {timeframes.map((tf, i) => (
            <button
              key={tf}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                i === 0
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Placeholder */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">Price Chart — NIFTY 50</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-dark-500">
            <Clock className="w-3 h-3" />
            Live
          </div>
        </div>
        {/* Future: Integrate TradingView widget or Recharts / Lightweight Charts */}
        <div className="h-96 bg-dark-800 rounded-lg flex items-center justify-center border border-dark-700">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-dark-600 mx-auto mb-3" />
            <p className="text-sm text-dark-400 font-medium">Chart Placeholder</p>
            <p className="text-xs text-dark-600 mt-1 max-w-xs mx-auto">
              Real-time charts will be integrated with TradingView or Lightweight Charts
              when live data feed is connected.
            </p>
          </div>
        </div>
      </div>

      {/* Volume Chart Placeholder */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-dark-400" />
          <h3 className="text-sm font-semibold text-white">Volume</h3>
        </div>
        <div className="h-32 bg-dark-800 rounded-lg flex items-center justify-center border border-dark-700">
          <p className="text-xs text-dark-500">Volume chart placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default Charts;

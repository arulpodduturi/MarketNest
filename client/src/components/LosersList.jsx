import { useNavigate } from 'react-router-dom';
import { TrendingDown } from 'lucide-react';

const LosersList = ({ losers = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-700">
        <TrendingDown className="w-4 h-4 text-red-400" />
        <h3 className="text-sm font-semibold text-white">Top Losers</h3>
      </div>
      <div className="divide-y divide-dark-800">
        {losers.length === 0 && (
          <p className="px-5 py-4 text-sm text-dark-500">No losers data</p>
        )}
        {losers.map((stock) => (
          <div
            key={stock.symbol}
            onClick={() => navigate(`/stock/${stock.symbol}`)}
            className="flex items-center justify-between px-5 py-3 hover:bg-dark-800/50 cursor-pointer transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-white">{stock.symbol}</p>
              <p className="text-xs text-dark-500 truncate max-w-[140px]">{stock.companyName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-medium text-white">
                {stock.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs font-mono font-medium text-red-400">
                {stock.changePercent?.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LosersList;

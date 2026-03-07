import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StockTable = ({ stocks = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-dark-700">
        <h3 className="text-sm font-semibold text-white">NSE Stocks</h3>
        <p className="text-xs text-dark-500 mt-0.5">Click on any stock for details</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700 text-dark-400 text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-semibold">Symbol</th>
              <th className="text-left px-5 py-3 font-semibold">Company</th>
              <th className="text-right px-5 py-3 font-semibold">LTP</th>
              <th className="text-right px-5 py-3 font-semibold">Change</th>
              <th className="text-right px-5 py-3 font-semibold">% Change</th>
              <th className="text-right px-5 py-3 font-semibold">Volume</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const isPositive = stock.change >= 0;
              return (
                <tr
                  key={stock.symbol}
                  onClick={() => navigate(`/stock/${stock.symbol}`)}
                  className="border-b border-dark-800 hover:bg-dark-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="font-semibold text-primary-400">{stock.symbol}</span>
                  </td>
                  <td className="px-5 py-3 text-dark-300 max-w-[200px] truncate">
                    {stock.companyName}
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-medium text-white">
                    {stock.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {isPositive ? '+' : ''}{stock.change?.toFixed(2)}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                  </td>
                  <td className="px-5 py-3 text-right text-dark-400 font-mono">
                    {stock.volume?.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;

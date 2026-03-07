import { TrendingUp, TrendingDown } from 'lucide-react';

const SummaryCard = ({ title, value, change, changePercent, icon: Icon }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-dark-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-dark-500" />}
      </div>
      <div className="text-xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : value}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>
            {isPositive ? '+' : ''}
            {change?.toFixed(2)}
          </span>
          <span className="text-dark-500 mx-0.5">|</span>
          <span>
            {isPositive ? '+' : ''}
            {changePercent?.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;

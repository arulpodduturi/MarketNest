/**
 * OISignalCell Component
 * Displays OI signal badge and strength bar for Call or Put side
 * Props: { oi, changeOI, side, maxOI }
 */

const getSignal = (changeOI, side) => {
  if (changeOI > 0) return side === 'call' ? 'Call OI Writing' : 'Put OI Writing';
  if (changeOI < 0) return side === 'call' ? 'Call OI Unwinding' : 'Put OI Unwinding';
  return 'Neutral';
};

const getBadgeColor = (changeOI, side) => {
  if (changeOI > 0) {
    return side === 'call' 
      ? 'bg-red-500/15 text-red-300 border border-red-600/30' 
      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-600/30';
  }
  if (changeOI < 0) return 'bg-amber-500/15 text-amber-300 border border-amber-600/30';
  return 'bg-dark-800 text-dark-400 border border-dark-700/30';
};

const getBarColor = (side) => side === 'call' ? 'bg-red-500' : 'bg-emerald-500';

const getDotColor = (changeOI, side) => {
  if (changeOI > 0) return side === 'call' ? 'bg-red-500' : 'bg-emerald-500';
  if (changeOI < 0) return 'bg-amber-500';
  return 'bg-dark-500';
};

const OISignalCell = ({ oi = 0, changeOI = 0, side = 'call', maxOI = 10000000 }) => {
  // Safety checks
  const safeOI = typeof oi === 'number' ? oi : 0;
  const safeChangeOI = typeof changeOI === 'number' ? changeOI : 0;
  const safeMaxOI = typeof maxOI === 'number' && maxOI > 0 ? maxOI : 10000000;
  
  const oiPercent = Math.min((safeOI / safeMaxOI) * 100, 100);
  const signal = getSignal(safeChangeOI, side);

  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium w-fit ${getBadgeColor(safeChangeOI, side)}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(safeChangeOI, side)}`} />
        {signal}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(side)} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${oiPercent}%` }}
            title={`OI: ${safeOI.toLocaleString()}`}
          />
        </div>
        <span className="text-[9px] text-dark-500 font-mono whitespace-nowrap w-8 text-right">
          {oiPercent.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default OISignalCell;

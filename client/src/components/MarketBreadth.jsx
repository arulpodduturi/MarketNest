import { ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';

// Mock market breadth data — replace with live NSE advance/decline API later
const breadthData = {
  advances: 1245,
  declines: 876,
  unchanged: 134,
  total: 2255,
  advanceVolume: '₹48,320 Cr',
  declineVolume: '₹31,540 Cr',
  fiiNet: '+₹1,245 Cr',
  diiNet: '-₹832 Cr',
};

const MarketBreadth = () => {
  const advPct = ((breadthData.advances / breadthData.total) * 100).toFixed(0);
  const decPct = ((breadthData.declines / breadthData.total) * 100).toFixed(0);

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-dark-700">
        <h3 className="text-sm font-semibold text-white">Market Breadth</h3>
        <p className="text-[10px] text-dark-500 mt-0.5">NSE — Advance / Decline</p>
      </div>
      <div className="p-4 space-y-4">
        {/* Advance / Decline Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ArrowUpCircle className="w-3.5 h-3.5" />
              {breadthData.advances} ({advPct}%)
            </span>
            <span className="text-dark-500 font-medium flex items-center gap-1">
              <MinusCircle className="w-3 h-3" />
              {breadthData.unchanged}
            </span>
            <span className="text-red-400 font-semibold flex items-center gap-1">
              {breadthData.declines} ({decPct}%)
              <ArrowDownCircle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full rounded-l-full"
              style={{ width: `${advPct}%` }}
            />
            <div
              className="bg-dark-500 h-full"
              style={{ width: `${((breadthData.unchanged / breadthData.total) * 100).toFixed(0)}%` }}
            />
            <div
              className="bg-red-500 h-full rounded-r-full"
              style={{ width: `${decPct}%` }}
            />
          </div>
        </div>

        {/* Volume & FII/DII */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-[10px] text-dark-500 uppercase font-semibold tracking-wider">Adv Volume</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">{breadthData.advanceVolume}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-[10px] text-dark-500 uppercase font-semibold tracking-wider">Dec Volume</p>
            <p className="text-sm font-bold text-red-400 mt-1">{breadthData.declineVolume}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-[10px] text-dark-500 uppercase font-semibold tracking-wider">FII Net</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">{breadthData.fiiNet}</p>
          </div>
          <div className="bg-dark-800 rounded-lg p-3">
            <p className="text-[10px] text-dark-500 uppercase font-semibold tracking-wider">DII Net</p>
            <p className="text-sm font-bold text-red-400 mt-1">{breadthData.diiNet}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketBreadth;

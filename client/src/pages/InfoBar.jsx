import React from 'react';

const InfoBar = ({ selectedStrikes = [], indexInfo = {}, fairPrice, lotSize }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 bg-dark-900 border border-dark-700 rounded-md">
      <div className="space-y-1">
        <p className="text-xs uppercase text-dark-400 tracking-wide">Selected Strikes</p>
        <p className="text-sm text-white font-medium">{selectedStrikes.join(', ') || '-'}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase text-dark-400 tracking-wide">Index</p>
          <p className="text-sm text-white font-medium">{indexInfo.symbol} ({indexInfo.expiry})</p>
          <p className="text-xs text-dark-400">{indexInfo.ts}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase text-dark-400 tracking-wide">Price</p>
          <p className="text-sm text-white font-medium">{indexInfo.price} <span className={`${indexInfo.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{indexInfo.change} ({indexInfo.changePct}%)</span></p>
          <p className="text-xs text-dark-400">Fair Price: <span className="text-white">{fairPrice}</span></p>
          <p className="text-xs text-dark-400">Lot Size: <span className="text-white">{lotSize}</span></p>
        </div>
      </div>
    </div>
  );
};

export default InfoBar;

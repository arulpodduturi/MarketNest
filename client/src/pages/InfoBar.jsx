import React from 'react';

const InfoBar = ({ selectedStrikes = [], indexInfo = {}, fairPrice, lotSize }) => {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <div className="text-sm text-dark-400">Selected Strikes: <span className="text-white">{selectedStrikes.join(', ')}</span></div>
        <div className="text-sm text-dark-400">{indexInfo.symbol} - {indexInfo.expiry} &nbsp; <span className="text-white">{indexInfo.price}</span> <span className={`ml-2 ${indexInfo.change>0? 'text-emerald-500' : 'text-rose-500'}`}>{indexInfo.change} ({indexInfo.changePct}%)</span> <span className="text-dark-400">{indexInfo.ts}</span></div>
      </div>
      <div className="text-sm text-dark-400">
        <div>Fair Price: <span className="text-white">{fairPrice}</span></div>
        <div>Lot Size: <span className="text-white">{lotSize}</span></div>
      </div>
    </div>
  );
};

export default InfoBar;

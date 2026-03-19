import React from 'react';

const TopFilters = ({
  dataMode,
  setDataMode,
  symbol,
  setSymbol,
  symbols,
  expiry,
  setExpiry,
  expiries,
  interval,
  setInterval,
  onSelectColumns,
  strikeFilter,
  setStrikeFilter,
  atm,
  setAtm,
  autoAdjustAtm,
  setAutoAdjustAtm,
  nearAtmFixed,
  setNearAtmFixed,
  viewMode,
  setViewMode,
  lcr,
  setLcr,
}) => {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
      {/* Left: two rows of controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Data Mode</label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="dataMode" checked={dataMode === 'latest'} onChange={() => setDataMode('latest')} />
              Latest
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="dataMode" checked={dataMode === 'historical'} onChange={() => setDataMode('historical')} />
              Historical
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Select Symbol</label>
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="bg-dark-800 px-2 py-1 rounded">
              {symbols.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Expiry Date</label>
            <select value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-dark-800 px-2 py-1 rounded">
              {expiries.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Select Interval</label>
            <select value={interval} onChange={(e) => setInterval(Number(e.target.value))} className="bg-dark-800 px-2 py-1 rounded">
              {[3,5,10,15,30,60].map(i => <option key={i} value={i}>{i} MIN</option>)}
            </select>
          </div>

          <div>
            <button onClick={onSelectColumns} className="bg-primary-600 text-white px-3 py-1 rounded">SELECT COLUMNS</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Strikes</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="strike" checked={strikeFilter==='selected'} onChange={() => setStrikeFilter('selected')} /> Selected</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="strike" checked={strikeFilter==='all'} onChange={() => setStrikeFilter('all')} /> All</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="strike" checked={strikeFilter==='nearatm'} onChange={() => setStrikeFilter('nearatm')} /> Near ATM</label>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">ATM</label>
            <input type="number" value={atm} onChange={(e) => setAtm(Number(e.target.value))} className="bg-dark-800 px-2 py-1 rounded w-20" />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autoAdjustAtm} onChange={(e) => setAutoAdjustAtm(e.target.checked)} /> Auto Adjust ATM</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nearAtmFixed} onChange={(e) => setNearAtmFixed(e.target.checked)} /> Near ATM fixed</label>
          </div>
        </div>
      </div>

      {/* Right: view toggles + L/Cr */}
      <div className="flex flex-col items-end gap-3">
        <div className="flex items-center gap-2">
          {['LOTS','QTY','VALUE'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1 rounded ${viewMode===m? 'bg-primary-600 text-white' : 'bg-dark-800'}`}>{m}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lcr} onChange={(e) => setLcr(e.target.checked)} /> L / Cr</label>
        </div>
      </div>
    </div>
  );
};

export default TopFilters;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TopFilters from './TopFilters';
import InfoBar from './InfoBar';
import OITable from './OITable';

const defaultSymbols = ['NIFTY'];
const defaultExpiries = ['30MAR26'];

const generateMockData = (symbol, expiry) => {
  const rows = [];
  const now = new Date();
  for (let h = 15; h >= 9; h--) {
    const time = `${h}:00`;
    const futPrice = 23200 + (Math.random() - 0.5) * 200;
    const futPriceChg = (Math.random() - 0.5) * 1000;
    const futPriceChgPct = (futPriceChg / futPrice) * 100;
    const vwap = futPrice + (Math.random() - 0.5) * 10;
    const iv = (Math.random() * 5 + 10).toFixed(2);
    const futVolume = Math.floor(Math.random() * 20000);
    const totalOi = Math.floor(Math.random() * 50000);
    const oiChange = Math.floor((Math.random() - 0.4) * 2000);
    const oiChangePct = ((oiChange / (totalOi || 1)) * 100).toFixed(2);
    const pcrOi = (Math.random() * 2).toFixed(2);
    const totCeOiCh = Math.floor((Math.random() - 0.5) * 2000);
    const totPeOiCh = Math.floor((Math.random() - 0.5) * 2000);
    const pcrOiCh = (Math.random() - 0.5).toFixed(2);
    const diff = totPeOiCh - totCeOiCh;
    const diffPct = ((diff / (Math.abs(totPeOiCh) + 1)) * 100).toFixed(2);
    const ceOiCh = Math.floor((Math.random() - 0.5) * 1000);
    const peOiCh = Math.floor((Math.random() - 0.5) * 1000);
    const oiTrend = oiChange > 0 ? '↑' : oiChange < 0 ? '↓' : '–';

    rows.push({
      time,
      futPrice: Math.round(futPrice * 100) / 100,
      futPriceChg: Math.round(futPriceChg * 100) / 100,
      futPriceChgPct: Math.round(futPriceChgPct * 100) / 100,
      vwap: Math.round(vwap * 100) / 100,
      iv,
      futVolume,
      totalOi,
      oiChange,
      oiChangePct,
      pcrOi,
      totCeOiCh,
      totPeOiCh,
      pcrOiCh,
      diff,
      diffPct,
      ceOiCh,
      peOiCh,
      oiTrend,
    });
  }
  return rows;
};

const OIAnalysisPage = () => {
  const [dataMode, setDataMode] = useState('latest');
  const [symbol, setSymbol] = useState(defaultSymbols[0]);
  const [symbols] = useState(defaultSymbols);
  const [expiry, setExpiry] = useState(defaultExpiries[0]);
  const [expiries] = useState(defaultExpiries);
  const [interval, setIntervalValue] = useState(10);
  const [strikeFilter, setStrikeFilter] = useState('nearatm');
  const [atm, setAtm] = useState(3);
  const [autoAdjustAtm, setAutoAdjustAtm] = useState(false);
  const [nearAtmFixed, setNearAtmFixed] = useState(false);
  const [viewMode, setViewMode] = useState('LOTS');
  const [lcr, setLcr] = useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const fetchData = useCallback(async (opts = { silent: false }) => {
    if (!opts.silent) setLoading(true);
    setError(null);

    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (e) {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const url = `/api/oi-analysis?symbol=${encodeURIComponent(symbol)}&interval=${interval}&expiry=${encodeURIComponent(expiry)}`;
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        console.error('API error', res.status, res.statusText);
        if (res.status === 404) {
          setData(generateMockData(symbol, expiry));
          setError(null);
          return;
        }
        throw new Error(`Status ${res.status}`);
      }
      const json = await res.json();
      const rows = json.data ?? json ?? [];
      setData(Array.isArray(rows) ? rows : []);
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error('Fetch /api/oi-analysis failed', e);
      // fallback to mock
      setData(generateMockData(symbol, expiry));
      setError(null);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }, [symbol, interval, expiry]);

  useEffect(() => {
    fetchData();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchData]);

  // Auto-refresh using selected interval in minutes
  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (autoRefresh) {
      const ms = Number(interval) * 60 * 1000;
      timerRef.current = setInterval(() => fetchData({ silent: true }), ms);
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [autoRefresh, interval, fetchData]);

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return data;
    return data.filter((r) => {
      const candidate = (r.symbol || r.scriptName || r.time || '').toString().toLowerCase();
      return candidate.includes(debouncedSearch.toLowerCase());
    });
  }, [data, debouncedSearch]);

  const summary = useMemo(() => {
    const totalRows = data.length;
    const totalOi = data.reduce((sum, r) => sum + (Number(r.totalOi) || 0), 0);
    const netOiChange = data.reduce((sum, r) => sum + (Number(r.oiChange) || 0), 0);
    const avgIv = totalRows > 0 ? (data.reduce((sum, r) => sum + (Number(r.iv) || 0), 0) / totalRows) : 0;
    return {
      totalRows,
      totalOi,
      netOiChange,
      avgIv: Number.isFinite(avgIv) ? avgIv.toFixed(2) : '0.00',
    };
  }, [data]);

  const onSelectColumns = () => {
    // UI-only placeholder for column selection
    alert('Select columns UI (not implemented)');
  };

  const info = {
    selectedStrikes: ['23200','23250','23300'],
    indexInfo: { symbol, expiry, price: '23,199.3', change: -529.20, changePct: -2.23, ts: new Date().toLocaleString() },
    fairPrice: '23,242.65',
    lotSize: 65,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">OI Analysis</h1>
          <p className="text-sm text-dark-400 mt-1">Real-time open interest and derivatives momentum view for {symbol} @ {expiry}.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-400">
          <span>Last refresh: {new Date().toLocaleTimeString('en-IN')}</span>
          <span className={`px-2 py-1 rounded ${autoRefresh ? 'bg-emerald-700 text-emerald-100' : 'bg-dark-800 text-dark-300'}`}>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="bg-dark-900 border border-dark-700 rounded p-3">
          <div className="text-xs text-dark-400">Rows</div>
          <div className="text-xl font-semibold">{summary.totalRows}</div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded p-3">
          <div className="text-xs text-dark-400">Total OI</div>
          <div className="text-xl font-semibold">{summary.totalOi.toLocaleString()}</div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded p-3">
          <div className="text-xs text-dark-400">Net OI Change</div>
          <div className={`text-xl font-semibold ${summary.netOiChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{summary.netOiChange.toLocaleString()}</div>
        </div>
        <div className="bg-dark-900 border border-dark-700 rounded p-3">
          <div className="text-xs text-dark-400">Avg IV</div>
          <div className="text-xl font-semibold">{summary.avgIv}</div>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-700 rounded p-4">
        <TopFilters
          dataMode={dataMode}
          setDataMode={setDataMode}
          symbol={symbol}
          setSymbol={setSymbol}
          symbols={symbols}
          expiry={expiry}
          setExpiry={setExpiry}
          expiries={expiries}
          interval={interval}
          setInterval={setIntervalValue}
          onSelectColumns={onSelectColumns}
          strikeFilter={strikeFilter}
          setStrikeFilter={setStrikeFilter}
          atm={atm}
          setAtm={setAtm}
          autoAdjustAtm={autoAdjustAtm}
          setAutoAdjustAtm={setAutoAdjustAtm}
          nearAtmFixed={nearAtmFixed}
          setNearAtmFixed={setNearAtmFixed}
          viewMode={viewMode}
          setViewMode={setViewMode}
          lcr={lcr}
          setLcr={setLcr}
        />
      </div>

      <InfoBar selectedStrikes={info.selectedStrikes} indexInfo={info.indexInfo} fairPrice={info.fairPrice} lotSize={info.lotSize} />

      <div className="flex flex-wrap items-center gap-3">
        <input placeholder="Search script" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-dark-800 px-3 py-2 rounded w-full md:w-64" />
        <button onClick={() => setAutoRefresh((v) => !v)} className="bg-dark-800 text-dark-100 px-3 py-2 rounded">{autoRefresh ? 'Stop Auto-refresh' : 'Start Auto-refresh'}</button>
        <button onClick={() => fetchData()} className="bg-primary-600 text-white px-3 py-2 rounded">Refresh Data</button>
      </div>

      {loading && <div className="text-center py-6 text-dark-400">Loading data...</div>}
      {!loading && filtered.length === 0 && <div className="text-center py-6 text-dark-400">No data available for selected filters</div>}

      <OITable data={filtered} />
    </div>
  );
};

export default OIAnalysisPage;

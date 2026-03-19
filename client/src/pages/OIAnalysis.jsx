import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const intervals = [3, 5, 10, 15, 30, 60];

const numberClass = (n) => {
  if (n == null) return '';
  return Number(n) > 0 ? 'text-emerald-500' : Number(n) < 0 ? 'text-rose-500' : '';
};

const formatNumber = (v) => {
  if (v == null) return '-';
  if (typeof v === 'number') return v.toLocaleString();
  const n = Number(v);
  return isNaN(n) ? v : n.toLocaleString();
};

const OIAnalysis = () => {
  const [interval, setIntervalValue] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const fetchData = useCallback(async (opts = { silent: false }) => {
    if (!opts.silent) setLoading(true);
    setError(null);

    // Abort previous
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch (e) {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/oi-analysis?interval=${interval}`, { signal: controller.signal });
      if (!res.ok) {
        console.error('API error', res.status, res.statusText);
        if (res.status === 404) {
          // treat as empty
          setData([]);
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
      console.error('Fetch OIAnalysis failed', e);
      setError(e.message ?? 'Failed to load data');
      setData([]);
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }, [interval]);

  // Load on mount and when interval changes
  useEffect(() => {
    fetchData();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData]);

  // Auto-refresh logic: uses selected interval in minutes
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoRefresh) {
      const ms = Number(interval) * 60 * 1000;
      timerRef.current = setInterval(() => fetchData({ silent: true }), ms);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoRefresh, interval, fetchData]);

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((r) => {
      const name = (r.scriptName || r.symbol || r.name || '').toString().toLowerCase();
      return name.includes(search.toLowerCase());
    });
  }, [data, search]);

  const computeMarketStatus = (row) => {
    const priceChange = Number(row.priceChange ?? row.futurePriceChange ?? row.price_change ?? row.price ?? 0);
    const callOiChange = Number(row.callOiChange ?? row.call_oi_change ?? row.callOIChange ?? row.callOiDelta ?? 0);
    const putOiChange = Number(row.putOiChange ?? row.put_oi_change ?? row.putOIChange ?? row.putOiDelta ?? 0);

    if (priceChange > 0 && callOiChange > 0) return 'Bullish';
    if (priceChange < 0 && putOiChange > 0) return 'Bearish';
    return 'Neutral';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-dark-300">Interval</label>
          <select
            value={interval}
            onChange={(e) => setIntervalValue(Number(e.target.value))}
            className="bg-dark-800 text-sm px-3 py-2 rounded-md"
          >
            {intervals.map((i) => (
              <option key={i} value={i}>{i} min</option>
            ))}
          </select>

          <label className="text-sm text-dark-300 flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Auto-refresh</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            placeholder="Search script"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-dark-800 px-3 py-2 text-sm rounded-md"
          />
          <button onClick={() => fetchData()} className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm">Refresh</button>
        </div>
      </div>

      <div className="bg-dark-900 rounded-md border border-dark-700 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-dark-400">
              <th className="px-4 py-2">Script Name</th>
              <th className="px-4 py-2">Future Price</th>
              <th className="px-4 py-2">Price Change</th>
              <th className="px-4 py-2">Volume</th>
              <th className="px-4 py-2">Open Interest</th>
              <th className="px-4 py-2">Change in OI</th>
              <th className="px-4 py-2">Call OI</th>
              <th className="px-4 py-2">Put OI</th>
              <th className="px-4 py-2">PE-CE Diff</th>
              <th className="px-4 py-2">Market Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-dark-400">Loading...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-rose-500">{error}</td>
              </tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-dark-400">No data available</td>
              </tr>
            )}

            {filtered.map((row, idx) => {
              const scriptName = row.scriptName ?? row.symbol ?? row.name ?? '';
              const futurePrice = row.futurePrice ?? row.future_price ?? row.price ?? 0;
              const priceChange = Number(row.priceChange ?? row.futurePriceChange ?? row.price_change ?? 0);
              const volume = row.volume ?? row.vol ?? 0;
              const oi = row.oi ?? row.openInterest ?? row.open_interest ?? 0;
              const oiChange = row.oiChange ?? row.oi_change ?? row.changeInOI ?? row.oiChangeValue ?? 0;
              const callOi = row.callOi ?? row.call_oi ?? row.callOI ?? row.co ?? 0;
              const putOi = row.putOi ?? row.put_oi ?? row.putOI ?? row.po ?? 0;
              const peCeDiff = row.peCeDiff ?? row.pe_ce_diff ?? row.peCe ?? 0;
              const marketStatus = computeMarketStatus(row);

              return (
                <tr key={idx} className="border-t border-dark-800 hover:bg-dark-800">
                  <td className="px-4 py-3">{scriptName}</td>
                  <td className={`px-4 py-3`}>{formatNumber(futurePrice)}</td>
                  <td className={`px-4 py-3 ${numberClass(priceChange)}`}>{formatNumber(priceChange)}</td>
                  <td className="px-4 py-3">{formatNumber(volume)}</td>
                  <td className={`px-4 py-3`}>{formatNumber(oi)}</td>
                  <td className={`px-4 py-3 ${numberClass(oiChange)}`}>{formatNumber(oiChange)}</td>
                  <td className={`px-4 py-3 ${numberClass(callOi)}`}>{formatNumber(callOi)}</td>
                  <td className={`px-4 py-3 ${numberClass(putOi)}`}>{formatNumber(putOi)}</td>
                  <td className={`px-4 py-3 ${numberClass(peCeDiff)}`}>{formatNumber(peCeDiff)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${marketStatus === 'Bullish' ? 'bg-emerald-800 text-emerald-300' : marketStatus === 'Bearish' ? 'bg-rose-800 text-rose-300' : 'bg-dark-800 text-dark-300'}`}>
                      {marketStatus}
                    </span>
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

export default OIAnalysis;

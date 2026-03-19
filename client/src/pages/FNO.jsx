import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Shield,
  Target,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  Layers,
  ArrowUpCircle,
  ArrowDownCircle,
  Zap,
  Gauge,
  Users,
  Crosshair,
  BookOpen,
  Clock,
} from 'lucide-react';
import { fetchOptionChain, fetchFNOSummary, fetchFNOAnalytics } from '../api/fnoApi';
import OISignalCell from '../components/OISignalCell';

// --- Formatting Helpers ---

const fmt = (val, decimals = 2) => {
  if (val === null || val === undefined) return '-';
  return val.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const fmtInt = (val) => {
  if (val === null || val === undefined) return '-';
  return val.toLocaleString('en-IN');
};

const fmtChange = (val) => {
  if (val === null || val === undefined) return '-';
  const prefix = val > 0 ? '+' : '';
  return prefix + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const changeColor = (val) => {
  if (val === null || val === undefined) return 'text-dark-400';
  if (val > 0) return 'text-emerald-400';
  if (val < 0) return 'text-red-400';
  return 'text-dark-400';
};

// --- Sub-components ---

const FNOSummaryCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-primary-600/10 text-primary-400 border-primary-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 hover:border-dark-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-dark-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${colorMap[color]}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {subtitle && <div className="text-xs text-dark-400 mt-1">{subtitle}</div>}
    </div>
  );
};

const AnalyticsCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-dark-900 border border-dark-700 rounded-xl overflow-hidden ${className}`}>
    <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-700">
      {Icon && <Icon className="w-4 h-4 text-primary-400" />}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const OIBuildupTable = ({ data, type }) => {
  if (!data || !data.length) return <p className="text-xs text-dark-500">No data</p>;
  const isCall = type === 'call';
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-dark-500 border-b border-dark-800">
          <th className="text-left py-1.5 font-medium">Strike</th>
          <th className="text-right py-1.5 font-medium">Chng in OI</th>
          <th className="text-right py-1.5 font-medium">OI</th>
          <th className="text-right py-1.5 font-medium">LTP</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b border-dark-800/50 hover:bg-dark-800/30">
            <td className="py-1.5 text-white font-medium">{fmtInt(row.strike)}</td>
            <td className={`py-1.5 text-right font-medium ${row.chngInOI > 0 ? (isCall ? 'text-red-400' : 'text-emerald-400') : (isCall ? 'text-emerald-400' : 'text-red-400')}`}>
              {fmtInt(row.chngInOI)}
            </td>
            <td className="py-1.5 text-right text-dark-300">{fmtInt(row.oi)}</td>
            <td className="py-1.5 text-right text-dark-300">{fmt(row.ltp)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const LevelsList = ({ data, type }) => {
  if (!data || !data.length) return <p className="text-xs text-dark-500">No data</p>;
  const isSupport = type === 'support';
  return (
    <div className="space-y-2">
      {data.map((level, i) => {
        const oi = isSupport ? level.putOI : level.callOI;
        const maxOI = data[0] ? (isSupport ? data[0].putOI : data[0].callOI) : 1;
        const pct = maxOI > 0 ? (oi / maxOI) * 100 : 0;
        return (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white font-medium">{fmtInt(level.strike)}</span>
              <span className="text-dark-400">{fmtInt(oi)} OI</span>
            </div>
            <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isSupport ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- Main FNO Page ---

const FNO = () => {
  const [loading, setLoading] = useState(true);
  const [optionChain, setOptionChain] = useState([]);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState('NIFTY');
  const [selectedExpiry, setSelectedExpiry] = useState('10-Mar-2026');
  const [nearATMOnly, setNearATMOnly] = useState(false);
  const [strikeSearch, setStrikeSearch] = useState('');
  const [availableExpiries, setAvailableExpiries] = useState([]);
  const [availableIndices, setAvailableIndices] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [chainRes, summaryRes, analyticsRes] = await Promise.allSettled([
        fetchOptionChain({ index: selectedIndex, expiry: selectedExpiry, nearATM: nearATMOnly, range: 15 }),
        fetchFNOSummary({ index: selectedIndex, expiry: selectedExpiry }),
        fetchFNOAnalytics({ index: selectedIndex, expiry: selectedExpiry }),
      ]);

      if (chainRes.status === 'fulfilled' && chainRes.value.success) {
        setOptionChain(chainRes.value.data || []);
        if (chainRes.value.meta) {
          setAvailableExpiries(chainRes.value.meta.availableExpiries || []);
          setAvailableIndices(chainRes.value.meta.availableIndices || []);
        }
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
        setSummary(summaryRes.value.data);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
        setAnalytics(analyticsRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load F&O data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedIndex, selectedExpiry, nearATMOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived: max OI for heatmap highlighting
  const { maxCallOI, maxPutOI, maxCallChngOI, maxPutChngOI } = useMemo(() => {
    let mco = 0, mpo = 0, mcco = 0, mpco = 0;
    for (const row of optionChain) {
      if (row.callOI > mco) mco = row.callOI;
      if (row.putOI > mpo) mpo = row.putOI;
      if (row.callChngInOI !== null && Math.abs(row.callChngInOI) > mcco) mcco = Math.abs(row.callChngInOI);
      if (row.putChngInOI !== null && Math.abs(row.putChngInOI) > mpco) mpco = Math.abs(row.putChngInOI);
    }
    return { maxCallOI: mco, maxPutOI: mpo, maxCallChngOI: mcco, maxPutChngOI: mpco };
  }, [optionChain]);

  // Filter by strike search
  const filteredChain = useMemo(() => {
    if (!strikeSearch.trim()) return optionChain;
    const search = parseFloat(strikeSearch.replace(/,/g, ''));
    if (isNaN(search)) return optionChain;
    return optionChain.filter(
      (row) => Math.abs(row.strike - search) <= 500
    );
  }, [optionChain, strikeSearch]);

  // OI bar intensity (0-1)
  const oiIntensity = (val, max) => {
    if (!val || !max) return 0;
    return Math.min(val / max, 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-dark-400">Loading F&O data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* === Section A: Filters Row === */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Index Selector */}
          <div className="relative">
            <label className="block text-[10px] text-dark-500 uppercase tracking-wider font-semibold mb-1">Index</label>
            <div className="relative">
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="appearance-none bg-dark-800 border border-dark-600 text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                {(availableIndices.length ? availableIndices : ['NIFTY', 'BANKNIFTY', 'FINNIFTY']).map((idx) => (
                  <option key={idx} value={idx}>{idx}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-dark-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Expiry Selector */}
          <div>
            <label className="block text-[10px] text-dark-500 uppercase tracking-wider font-semibold mb-1">Expiry</label>
            <div className="relative">
              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                className="appearance-none bg-dark-800 border border-dark-600 text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                {(availableExpiries.length ? availableExpiries : ['10-Mar-2026']).map((exp) => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-dark-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Strike Search */}
          <div>
            <label className="block text-[10px] text-dark-500 uppercase tracking-wider font-semibold mb-1">Strike Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-dark-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. 24500"
                value={strikeSearch}
                onChange={(e) => setStrikeSearch(e.target.value)}
                className="bg-dark-800 border border-dark-600 text-white text-sm rounded-lg pl-8 pr-3 py-2 w-36 focus:outline-none focus:border-primary-500 placeholder:text-dark-600"
              />
            </div>
          </div>

          {/* Near ATM Toggle */}
          <div>
            <label className="block text-[10px] text-dark-500 uppercase tracking-wider font-semibold mb-1">View</label>
            <button
              onClick={() => setNearATMOnly(!nearATMOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                nearATMOnly
                  ? 'bg-primary-600/15 border-primary-500/30 text-primary-400'
                  : 'bg-dark-800 border-dark-600 text-dark-400 hover:text-white hover:border-dark-500'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {nearATMOnly ? 'Near ATM' : 'All Strikes'}
            </button>
          </div>

          {/* Refresh */}
          <div className="ml-auto">
            <label className="block text-[10px] text-dark-500 uppercase tracking-wider font-semibold mb-1">&nbsp;</label>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* === Section B: Summary Cards === */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <FNOSummaryCard
            title="Spot Price"
            value={summary.spotPrice ? fmt(summary.spotPrice) : '-'}
            subtitle={`${summary.index} ${summary.expiry}`}
            icon={Activity}
            color="primary"
          />
          <FNOSummaryCard
            title="PCR (OI)"
            value={summary.pcr !== null ? summary.pcr.toFixed(3) : '-'}
            subtitle={summary.pcr >= 1 ? 'Bullish bias' : summary.pcr < 0.7 ? 'Bearish bias' : 'Neutral'}
            icon={BarChart3}
            color={summary.pcr >= 1 ? 'emerald' : summary.pcr < 0.7 ? 'red' : 'amber'}
          />
          <FNOSummaryCard
            title="Max Call OI"
            value={fmtInt(summary.maxCallOI)}
            subtitle={`Strike ${fmtInt(summary.maxCallOIStrike)}`}
            icon={ArrowUpCircle}
            color="red"
          />
          <FNOSummaryCard
            title="Max Put OI"
            value={fmtInt(summary.maxPutOI)}
            subtitle={`Strike ${fmtInt(summary.maxPutOIStrike)}`}
            icon={ArrowDownCircle}
            color="emerald"
          />
          <FNOSummaryCard
            title="Total Call OI"
            value={fmtInt(summary.totalCallOI)}
            subtitle="Resistance side"
            icon={Shield}
            color="red"
          />
          <FNOSummaryCard
            title="Total Put OI"
            value={fmtInt(summary.totalPutOI)}
            subtitle="Support side"
            icon={Target}
            color="emerald"
          />
        </div>
      )}

      {/* === Section C: Option Chain Table === */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-white">Option Chain</h2>
            <span className="text-xs text-dark-500 ml-2">{filteredChain.length} strikes</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-dark-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> ATM</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Max Call OI</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Max Put OI</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr className="bg-dark-800">
                <th colSpan={7} className="text-center py-2 text-red-400 font-semibold text-[11px] uppercase tracking-wider border-b border-dark-700 border-r border-dark-700">
                  Calls
                </th>
                <th className="text-center py-2 text-dark-300 font-semibold text-[11px] uppercase tracking-wider border-b border-dark-700 border-r border-dark-700">
                  Strike
                </th>
                <th colSpan={7} className="text-center py-2 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider border-b border-dark-700">
                  Puts
                </th>
              </tr>
              <tr className="bg-dark-800/80 text-dark-400 font-medium">
                <th className="text-right px-2 py-2 border-b border-dark-700">OI</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">Chng OI</th>
                <th className="px-2 py-2 border-b border-dark-700 text-left">OI Signal</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">Volume</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">IV</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">LTP</th>
                <th className="text-right px-2 py-2 border-b border-dark-700 border-r border-dark-700">Chng</th>
                <th className="text-center px-3 py-2 border-b border-dark-700 border-r border-dark-700 text-white font-bold">Strike</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">Chng</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">LTP</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">IV</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">Volume</th>
                <th className="px-2 py-2 border-b border-dark-700 text-left">OI Signal</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">Chng OI</th>
                <th className="text-right px-2 py-2 border-b border-dark-700">OI</th>
              </tr>
            </thead>
            <tbody>
              {filteredChain.map((row) => {
                const isATM = summary && row.strike === summary.atmStrike;
                const isMaxCallOI = summary && row.strike === summary.maxCallOIStrike;
                const isMaxPutOI = summary && row.strike === summary.maxPutOIStrike;

                // Background intensity for OI heatmap
                const callOIOpacity = oiIntensity(row.callOI, maxCallOI) * 0.15;
                const putOIOpacity = oiIntensity(row.putOI, maxPutOI) * 0.15;

                let rowBg = '';
                if (isATM) rowBg = 'bg-amber-500/10';
                else if (isMaxCallOI) rowBg = 'bg-red-500/5';
                else if (isMaxPutOI) rowBg = 'bg-emerald-500/5';

                // ITM shading: Calls ITM when strike < spot, Puts ITM when strike > spot
                const spot = summary?.spotPrice || 0;
                const callITM = row.strike < spot;
                const putITM = row.strike > spot;

                return (
                  <tr
                    key={row.strike}
                    className={`border-b border-dark-800/50 hover:bg-dark-800/40 transition-colors ${rowBg}`}
                  >
                    {/* Call OI */}
                    <td className="text-right px-2 py-1.5 relative">
                      {callITM && <div className="absolute inset-0 bg-dark-700/20" />}
                      <div className="absolute inset-0 bg-red-500 pointer-events-none" style={{ opacity: callOIOpacity }} />
                      <span className={`relative ${isMaxCallOI ? 'text-red-300 font-bold' : 'text-dark-300'}`}>
                        {fmtInt(row.callOI)}
                      </span>
                    </td>
                    {/* Call Chng in OI */}
                    <td className={`text-right px-2 py-1.5 ${changeColor(row.callChngInOI)} font-medium`}>
                      {fmtInt(row.callChngInOI)}
                    </td>
                    {/* Call OI Signal */}
                    <td className="px-2 py-1.5">
                      <OISignalCell oi={row.callOI} changeOI={row.callChngInOI} side="call" maxOI={maxCallOI} />
                    </td>
                    {/* Call Volume */}
                    <td className="text-right px-2 py-1.5 text-dark-400">{fmtInt(row.callVolume)}</td>
                    {/* Call IV */}
                    <td className="text-right px-2 py-1.5 text-dark-400">{row.callIV !== null ? fmt(row.callIV) : '-'}</td>
                    {/* Call LTP */}
                    <td className="text-right px-2 py-1.5 text-white font-medium">{fmt(row.callLTP)}</td>
                    {/* Call Chng */}
                    <td className={`text-right px-2 py-1.5 border-r border-dark-700 ${changeColor(row.callChng)} font-medium`}>
                      {fmtChange(row.callChng)}
                    </td>

                    {/* Strike */}
                    <td className={`text-center px-3 py-1.5 border-r border-dark-700 font-bold ${
                      isATM ? 'text-amber-300 bg-amber-500/10' : 'text-white'
                    }`}>
                      {fmtInt(row.strike)}
                      {isATM && <span className="ml-1 text-[9px] text-amber-400 font-normal">ATM</span>}
                    </td>

                    {/* Put Chng */}
                    <td className={`text-right px-2 py-1.5 ${changeColor(row.putChng)} font-medium`}>
                      {fmtChange(row.putChng)}
                    </td>
                    {/* Put LTP */}
                    <td className="text-right px-2 py-1.5 text-white font-medium">{fmt(row.putLTP)}</td>
                    {/* Put IV */}
                    <td className="text-right px-2 py-1.5 text-dark-400">{row.putIV !== null ? fmt(row.putIV) : '-'}</td>
                    {/* Put Volume */}
                    <td className="text-right px-2 py-1.5 text-dark-400">{fmtInt(row.putVolume)}</td>
                    {/* Put OI Signal */}
                    <td className="px-2 py-1.5">
                      <OISignalCell oi={row.putOI} changeOI={row.putChngInOI} side="put" maxOI={maxPutOI} />
                    </td>
                    {/* Put Chng in OI */}
                    <td className={`text-right px-2 py-1.5 ${changeColor(row.putChngInOI)} font-medium`}>
                      {fmtInt(row.putChngInOI)}
                    </td>
                    {/* Put OI */}
                    <td className="text-right px-2 py-1.5 relative">
                      {putITM && <div className="absolute inset-0 bg-dark-700/20" />}
                      <div className="absolute inset-0 bg-emerald-500 pointer-events-none" style={{ opacity: putOIOpacity }} />
                      <span className={`relative ${isMaxPutOI ? 'text-emerald-300 font-bold' : 'text-dark-300'}`}>
                        {fmtInt(row.putOI)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* === Section D: Analytics Widgets === */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Top Call OI Buildup */}
          <AnalyticsCard title="Top Call OI Buildup" icon={TrendingUp}>
            <OIBuildupTable data={analytics.callOIBuildup} type="call" />
          </AnalyticsCard>

          {/* Top Put OI Buildup */}
          <AnalyticsCard title="Top Put OI Buildup" icon={TrendingDown}>
            <OIBuildupTable data={analytics.putOIBuildup} type="put" />
          </AnalyticsCard>

          {/* ATM Summary */}
          <AnalyticsCard title="ATM Summary" icon={Zap}>
            {analytics.atmSummary ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400 text-xs">ATM Strike</span>
                  <span className="text-white font-bold text-sm">{fmtInt(analytics.atmSummary.strike)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dark-800 rounded-lg p-2.5">
                    <div className="text-[10px] text-red-400 uppercase font-semibold mb-1">Call</div>
                    <div className="text-white text-sm font-bold">{fmt(analytics.atmSummary.callLTP)}</div>
                    <div className="text-dark-400 text-[10px] mt-0.5">IV: {fmt(analytics.atmSummary.callIV)}%</div>
                    <div className="text-dark-400 text-[10px]">OI: {fmtInt(analytics.atmSummary.callOI)}</div>
                    <div className="text-dark-400 text-[10px]">Vol: {fmtInt(analytics.atmSummary.callVolume)}</div>
                  </div>
                  <div className="bg-dark-800 rounded-lg p-2.5">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold mb-1">Put</div>
                    <div className="text-white text-sm font-bold">{fmt(analytics.atmSummary.putLTP)}</div>
                    <div className="text-dark-400 text-[10px] mt-0.5">IV: {fmt(analytics.atmSummary.putIV)}%</div>
                    <div className="text-dark-400 text-[10px]">OI: {fmtInt(analytics.atmSummary.putOI)}</div>
                    <div className="text-dark-400 text-[10px]">Vol: {fmtInt(analytics.atmSummary.putVolume)}</div>
                  </div>
                </div>
                {analytics.atmSummary.straddle !== null && (
                  <div className="flex items-center justify-between bg-dark-800 rounded-lg p-2.5">
                    <span className="text-dark-400 text-xs">Straddle Premium</span>
                    <span className="text-primary-400 font-bold text-sm">{fmt(analytics.atmSummary.straddle)}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-dark-500">No ATM data</p>
            )}
          </AnalyticsCard>

          {/* Resistance Levels */}
          <AnalyticsCard title="Resistance Levels (Call OI)" icon={ArrowUpCircle}>
            <LevelsList data={analytics.resistanceLevels} type="resistance" />
          </AnalyticsCard>

          {/* Support Levels */}
          <AnalyticsCard title="Support Levels (Put OI)" icon={ArrowDownCircle}>
            <LevelsList data={analytics.supportLevels} type="support" />
          </AnalyticsCard>

          {/* PCR & IV Skew */}
          <AnalyticsCard title="PCR & IV Analysis" icon={BarChart3}>
            <div className="space-y-4">
              {/* PCR Gauge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark-400 text-xs">Put-Call Ratio (OI)</span>
                  <span className={`font-bold text-sm ${
                    analytics.pcr >= 1 ? 'text-emerald-400' : analytics.pcr < 0.7 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {analytics.pcr !== null ? analytics.pcr.toFixed(3) : '-'}
                  </span>
                </div>
                <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      analytics.pcr >= 1 ? 'bg-emerald-500' : analytics.pcr < 0.7 ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min((analytics.pcr || 0) / 2 * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-dark-500 mt-1">
                  <span>Bearish</span>
                  <span>Neutral</span>
                  <span>Bullish</span>
                </div>
              </div>

              {/* IV Skew */}
              {analytics.ivSkew && (
                <div>
                  <div className="text-xs text-dark-400 mb-2">IV Skew (Near ATM Avg)</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-red-400 uppercase font-semibold">Call IV</div>
                      <div className="text-white font-bold text-sm mt-0.5">
                        {analytics.ivSkew.avgCallIV !== null ? `${fmt(analytics.ivSkew.avgCallIV)}%` : '-'}
                      </div>
                    </div>
                    <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-emerald-400 uppercase font-semibold">Put IV</div>
                      <div className="text-white font-bold text-sm mt-0.5">
                        {analytics.ivSkew.avgPutIV !== null ? `${fmt(analytics.ivSkew.avgPutIV)}%` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnalyticsCard>

          {/* Call OI Unwinding */}
          <AnalyticsCard title="Call OI Unwinding" icon={TrendingDown}>
            <OIBuildupTable data={analytics.callOIUnwinding} type="call" />
          </AnalyticsCard>

          {/* Put OI Unwinding */}
          <AnalyticsCard title="Put OI Unwinding" icon={TrendingUp}>
            <OIBuildupTable data={analytics.putOIUnwinding} type="put" />
          </AnalyticsCard>
        </div>
      )}

      {/* === Section E: Extended F&O Widgets === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Market Mood Index */}
        <AnalyticsCard title="Market Mood Index" icon={Gauge}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400 text-xs">Current Mood</span>
              <span className="text-amber-400 font-bold text-sm">Neutral</span>
            </div>
            {/* Mood gauge visualization */}
            <div>
              <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden flex">
                <div className="bg-red-500 h-full" style={{ width: '20%' }} />
                <div className="bg-amber-500 h-full" style={{ width: '30%' }} />
                <div className="bg-emerald-500 h-full" style={{ width: '50%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-dark-500 mt-1.5">
                <span>Fear</span>
                <span>Neutral</span>
                <span>Greed</span>
              </div>
              {/* Pointer indicator */}
              <div className="relative mt-1">
                <div className="absolute left-[48%] -top-1 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-amber-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-dark-800 rounded-lg p-2 text-center">
                <div className="text-[10px] text-dark-500 font-medium">VIX</div>
                <div className="text-white font-bold text-xs mt-0.5">14.32</div>
              </div>
              <div className="bg-dark-800 rounded-lg p-2 text-center">
                <div className="text-[10px] text-dark-500 font-medium">Score</div>
                <div className="text-amber-400 font-bold text-xs mt-0.5">52/100</div>
              </div>
              <div className="bg-dark-800 rounded-lg p-2 text-center">
                <div className="text-[10px] text-dark-500 font-medium">Prev</div>
                <div className="text-dark-300 font-bold text-xs mt-0.5">48/100</div>
              </div>
            </div>
          </div>
        </AnalyticsCard>

        {/* FII/DII F&O Activity — mock data, replace with live NSE data later */}
        <AnalyticsCard title="FII/DII F&O Activity" icon={Users}>
          <div className="space-y-3">
            <div className="text-[10px] text-dark-500 uppercase font-semibold tracking-wider mb-2">Index Futures</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-800 rounded-lg p-2.5">
                <div className="text-[10px] text-primary-400 uppercase font-semibold">FII</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">+₹2,340 Cr</div>
                <div className="text-dark-500 text-[10px]">Long: 68% | Short: 32%</div>
              </div>
              <div className="bg-dark-800 rounded-lg p-2.5">
                <div className="text-[10px] text-primary-400 uppercase font-semibold">DII</div>
                <div className="text-red-400 font-bold text-sm mt-0.5">-₹1,120 Cr</div>
                <div className="text-dark-500 text-[10px]">Long: 42% | Short: 58%</div>
              </div>
            </div>
            <div className="text-[10px] text-dark-500 uppercase font-semibold tracking-wider mt-3 mb-2">Index Options</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-800 rounded-lg p-2.5">
                <div className="text-[10px] text-primary-400 uppercase font-semibold">FII</div>
                <div className="text-red-400 font-bold text-sm mt-0.5">-₹5,680 Cr</div>
                <div className="text-dark-500 text-[10px]">CE: 54% | PE: 46%</div>
              </div>
              <div className="bg-dark-800 rounded-lg p-2.5">
                <div className="text-[10px] text-primary-400 uppercase font-semibold">DII</div>
                <div className="text-emerald-400 font-bold text-sm mt-0.5">+₹3,210 Cr</div>
                <div className="text-dark-500 text-[10px]">CE: 38% | PE: 62%</div>
              </div>
            </div>
          </div>
        </AnalyticsCard>

        {/* Max Pain Analysis — mock data, replace with computed values from option chain later */}
        <AnalyticsCard title="Max Pain Analysis" icon={Crosshair}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-dark-400 text-xs">Max Pain Strike</span>
              <span className="text-primary-400 font-bold text-lg">{summary ? fmtInt(summary.atmStrike || 22400) : '22,400'}</span>
            </div>
            <div className="bg-dark-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-dark-500 text-[10px] uppercase font-semibold">Spot vs Max Pain</span>
                <span className="text-xs text-amber-400 font-medium">
                  {summary ? (summary.spotPrice > (summary.atmStrike || 22400) ? 'Above' : 'Below') : 'Near'} Max Pain
                </span>
              </div>
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden relative">
                <div className="absolute left-[50%] top-0 w-0.5 h-full bg-primary-400 z-10" title="Max Pain" />
                <div
                  className="h-full bg-amber-500/40 rounded-full"
                  style={{ width: '55%' }}
                  title="Spot position"
                />
              </div>
              <div className="flex justify-between text-[10px] text-dark-500 mt-1">
                <span>Lower Strikes</span>
                <span className="text-primary-400">MP</span>
                <span>Higher Strikes</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-dark-500 font-medium">CE Pain</div>
                <div className="text-red-400 font-bold text-xs mt-0.5">₹18,450 Cr</div>
              </div>
              <div className="bg-dark-800 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-dark-500 font-medium">PE Pain</div>
                <div className="text-emerald-400 font-bold text-xs mt-0.5">₹15,230 Cr</div>
              </div>
            </div>
            <p className="text-[10px] text-dark-600 mt-1">
              Max Pain suggests NIFTY may gravitate towards this level by expiry.
            </p>
          </div>
        </AnalyticsCard>

        {/* Strategy Suggestions — mock data placeholder for future strategy engine */}
        <AnalyticsCard title="Strategy Suggestions" icon={BookOpen}>
          <div className="space-y-2.5">
            {[
              { name: 'Iron Condor', bias: 'Neutral', risk: 'Low', strikes: '22200-22300 / 22500-22600', premium: '₹142' },
              { name: 'Bull Put Spread', bias: 'Bullish', risk: 'Medium', strikes: '22200-22300 PE', premium: '₹85' },
              { name: 'Bear Call Spread', bias: 'Bearish', risk: 'Medium', strikes: '22500-22600 CE', premium: '₹72' },
            ].map((strat, i) => (
              <div key={i} className="bg-dark-800 rounded-lg p-3 hover:bg-dark-700/50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-sm font-semibold">{strat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    strat.bias === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    strat.bias === 'Bearish' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {strat.bias}
                  </span>
                </div>
                <div className="text-[10px] text-dark-400">Strikes: {strat.strikes}</div>
                <div className="flex items-center gap-3 mt-1 text-[10px]">
                  <span className="text-dark-500">Risk: <span className="text-dark-300">{strat.risk}</span></span>
                  <span className="text-dark-500">Net Premium: <span className="text-primary-400 font-medium">{strat.premium}</span></span>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-dark-600 mt-1">
              Based on current OI, IV & spot levels. Not financial advice.
            </p>
          </div>
        </AnalyticsCard>

        {/* Expiry Calendar / Countdown */}
        <AnalyticsCard title="Expiry Countdown" icon={Clock}>
          <div className="space-y-3">
            {[
              { label: 'Weekly (NIFTY)', date: '13 Mar 2026', days: 1, type: 'weekly' },
              { label: 'Weekly (BANKNIFTY)', date: '12 Mar 2026', days: 0, type: 'today' },
              { label: 'Monthly', date: '27 Mar 2026', days: 15, type: 'monthly' },
            ].map((exp, i) => (
              <div key={i} className="bg-dark-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{exp.label}</p>
                  <p className="text-[10px] text-dark-500 mt-0.5">{exp.date}</p>
                </div>
                <div className={`text-right ${
                  exp.days === 0 ? 'text-red-400' : exp.days <= 2 ? 'text-amber-400' : 'text-dark-300'
                }`}>
                  <p className="text-lg font-bold">{exp.days === 0 ? 'Today' : `${exp.days}d`}</p>
                  <p className="text-[10px] text-dark-500">{exp.type}</p>
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        {/* Greeks Calculator Placeholder */}
        <AnalyticsCard title="Quick Greeks (ATM)" icon={Zap}>
          {analytics?.atmSummary ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-red-400 uppercase font-semibold mb-2">Call Greeks</div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Delta', value: '0.52' },
                      { label: 'Gamma', value: '0.0012' },
                      { label: 'Theta', value: '-8.45' },
                      { label: 'Vega', value: '12.30' },
                    ].map((g) => (
                      <div key={g.label} className="flex items-center justify-between text-xs">
                        <span className="text-dark-500">{g.label}</span>
                        <span className="text-white font-medium font-mono">{g.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold mb-2">Put Greeks</div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Delta', value: '-0.48' },
                      { label: 'Gamma', value: '0.0012' },
                      { label: 'Theta', value: '-7.92' },
                      { label: 'Vega', value: '12.30' },
                    ].map((g) => (
                      <div key={g.label} className="flex items-center justify-between text-xs">
                        <span className="text-dark-500">{g.label}</span>
                        <span className="text-white font-medium font-mono">{g.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-dark-600">
                Mock Greeks for ATM strike. Plug in Black-Scholes engine for live values.
              </p>
            </div>
          ) : (
            <p className="text-xs text-dark-500">Load analytics to see Greeks</p>
          )}
        </AnalyticsCard>
      </div>
    </div>
  );
};

export default FNO;

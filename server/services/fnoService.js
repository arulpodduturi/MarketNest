import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CSV Parsing Utilities ---

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseNum(val) {
  if (!val || val === '-' || val === '') return null;
  const cleaned = val.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// --- Load & Parse Option Chain CSV ---

function loadOptionChainCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);

  // Row 0: "CALLS,,PUTS" — skip
  // Row 1: Column headers
  // Row 2+: Data
  if (lines.length < 3) return [];

  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    // fields[0] is empty (leading comma), fields[22] is empty (trailing comma)
    const row = {
      callOI: parseNum(fields[1]),
      callChngInOI: parseNum(fields[2]),
      callVolume: parseNum(fields[3]),
      callIV: parseNum(fields[4]),
      callLTP: parseNum(fields[5]),
      callChng: parseNum(fields[6]),
      callBidQty: parseNum(fields[7]),
      callBid: parseNum(fields[8]),
      callAsk: parseNum(fields[9]),
      callAskQty: parseNum(fields[10]),
      strike: parseNum(fields[11]),
      putBidQty: parseNum(fields[12]),
      putBid: parseNum(fields[13]),
      putAsk: parseNum(fields[14]),
      putAskQty: parseNum(fields[15]),
      putChng: parseNum(fields[16]),
      putLTP: parseNum(fields[17]),
      putIV: parseNum(fields[18]),
      putVolume: parseNum(fields[19]),
      putChngInOI: parseNum(fields[20]),
      putOI: parseNum(fields[21]),
    };
    if (row.strike !== null) {
      rows.push(row);
    }
  }
  return rows;
}

// --- Data Cache ---

const dataCache = {};

function getCSVPath(index, expiry) {
  // For now, we only have one CSV file. Future: map index+expiry to file paths.
  return path.join(__dirname, '..', 'data', 'option-chain-ED-NIFTY-10-Mar-2026.csv');
}

function getOptionChainData(index = 'NIFTY', expiry = '10-Mar-2026') {
  const key = `${index}_${expiry}`;
  if (!dataCache[key]) {
    const csvPath = getCSVPath(index, expiry);
    if (!fs.existsSync(csvPath)) {
      return [];
    }
    dataCache[key] = loadOptionChainCSV(csvPath);
  }
  return dataCache[key];
}

// --- Compute Spot Price (Synthetic Futures) ---

function computeSpotPrice(rows) {
  // Find the strike where |callLTP - putLTP| is minimized (ATM proxy)
  let minDiff = Infinity;
  let spotEstimate = null;
  for (const row of rows) {
    if (row.callLTP !== null && row.putLTP !== null && row.callVolume !== null && row.putVolume !== null) {
      const diff = Math.abs(row.callLTP - row.putLTP);
      if (diff < minDiff) {
        minDiff = diff;
        spotEstimate = row.strike + row.callLTP - row.putLTP;
      }
    }
  }
  return spotEstimate ? Math.round(spotEstimate * 100) / 100 : null;
}

// --- Summary ---

export function getOptionChainRows(index, expiry) {
  return getOptionChainData(index, expiry);
}

export function getSummary(index, expiry) {
  const rows = getOptionChainData(index, expiry);
  if (!rows.length) return null;

  let totalCallOI = 0;
  let totalPutOI = 0;
  let maxCallOI = 0;
  let maxCallOIStrike = null;
  let maxPutOI = 0;
  let maxPutOIStrike = null;

  for (const row of rows) {
    if (row.callOI !== null) {
      totalCallOI += row.callOI;
      if (row.callOI > maxCallOI) {
        maxCallOI = row.callOI;
        maxCallOIStrike = row.strike;
      }
    }
    if (row.putOI !== null) {
      totalPutOI += row.putOI;
      if (row.putOI > maxPutOI) {
        maxPutOI = row.putOI;
        maxPutOIStrike = row.strike;
      }
    }
  }

  const pcr = totalCallOI > 0 ? Math.round((totalPutOI / totalCallOI) * 1000) / 1000 : null;
  const spotPrice = computeSpotPrice(rows);

  // ATM strike: closest strike to spot
  let atmStrike = null;
  let atmDiff = Infinity;
  for (const row of rows) {
    if (spotPrice !== null) {
      const diff = Math.abs(row.strike - spotPrice);
      if (diff < atmDiff) {
        atmDiff = diff;
        atmStrike = row.strike;
      }
    }
  }

  // Get ATM row data for ATM-specific metrics
  let atmCallOI = null;
  let atmPutOI = null;
  let atmPCR = null;
  if (atmStrike) {
    const atmRow = rows.find((r) => r.strike === atmStrike);
    if (atmRow) {
      atmCallOI = atmRow.callOI;
      atmPutOI = atmRow.putOI;
      atmPCR = atmCallOI > 0 ? Math.round((atmPutOI / atmCallOI) * 1000) / 1000 : null;
    }
  }

  // Mock Future Price (typically spot + small premium)
  const futurePrice = spotPrice ? Math.round((spotPrice + (spotPrice * 0.002)) * 100) / 100 : null;
  const futurePremium = spotPrice && futurePrice ? Math.round((futurePrice - spotPrice) * 100) / 100 : null;

  return {
    spotPrice,
    futurePrice,
    futurePremium,
    pcr,
    atmCallOI,
    atmPutOI,
    atmPCR,
    maxCallOI,
    maxCallOIStrike,
    maxPutOI,
    maxPutOIStrike,
    totalCallOI,
    totalPutOI,
    atmStrike,
    expiry: expiry || '10-Mar-2026',
    index: index || 'NIFTY',
  };
}

// --- Analytics ---

export function getAnalytics(index, expiry) {
  const rows = getOptionChainData(index, expiry);
  if (!rows.length) return null;

  const summary = getSummary(index, expiry);

  // Top Call OI buildup (top 5 by change in OI, positive = new longs/shorts)
  const callOIBuildup = rows
    .filter((r) => r.callChngInOI !== null && r.callChngInOI > 0)
    .sort((a, b) => b.callChngInOI - a.callChngInOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, chngInOI: r.callChngInOI, oi: r.callOI, ltp: r.callLTP }));

  // Top Put OI buildup
  const putOIBuildup = rows
    .filter((r) => r.putChngInOI !== null && r.putChngInOI > 0)
    .sort((a, b) => b.putChngInOI - a.putChngInOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, chngInOI: r.putChngInOI, oi: r.putOI, ltp: r.putLTP }));

  // Top Call OI unwinding (largest negative change in OI)
  const callOIUnwinding = rows
    .filter((r) => r.callChngInOI !== null && r.callChngInOI < 0)
    .sort((a, b) => a.callChngInOI - b.callChngInOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, chngInOI: r.callChngInOI, oi: r.callOI, ltp: r.callLTP }));

  // Top Put OI unwinding
  const putOIUnwinding = rows
    .filter((r) => r.putChngInOI !== null && r.putChngInOI < 0)
    .sort((a, b) => a.putChngInOI - b.putChngInOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, chngInOI: r.putChngInOI, oi: r.putOI, ltp: r.putLTP }));

  // Call OI Writing: Strikes with high Call OI buildup + price decline (writers adding positions)
  // Writers profit when price falls, so we look for positive OI change with negative price change
  const callOIWriting = rows
    .filter((r) => r.callChngInOI !== null && r.callChngInOI > 0 && r.callChng !== null && r.callChng <= 0)
    .sort((a, b) => b.callChngInOI - a.callChngInOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, chngInOI: r.callChngInOI, oi: r.callOI, ltp: r.callLTP }));

  // Put OI Writing: Strikes with high Put OI buildup + price decline (writers adding positions)
  // Writers profit when price rises, so we look for positive OI change with negative price change
  const putOIWriting = rows
    .filter((r) => r.putChngInOI !== null && r.putChngInOI > 0 && r.putChng !== null && r.putChng <= 0)
    .sort((a, b) => b.putChngInOI - a.putChngInOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, chngInOI: r.putChngInOI, oi: r.putOI, ltp: r.putLTP }));

  // Resistance levels: top 5 strikes by Call OI (where call writers are concentrated)
  const resistanceLevels = rows
    .filter((r) => r.callOI !== null)
    .sort((a, b) => b.callOI - a.callOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, callOI: r.callOI, callChngInOI: r.callChngInOI }));

  // Support levels: top 5 strikes by Put OI (where put writers are concentrated)
  const supportLevels = rows
    .filter((r) => r.putOI !== null)
    .sort((a, b) => b.putOI - a.putOI)
    .slice(0, 5)
    .map((r) => ({ strike: r.strike, putOI: r.putOI, putChngInOI: r.putChngInOI }));

  // ATM summary
  let atmSummary = null;
  if (summary.atmStrike) {
    const atmRow = rows.find((r) => r.strike === summary.atmStrike);
    if (atmRow) {
      atmSummary = {
        strike: atmRow.strike,
        callLTP: atmRow.callLTP,
        putLTP: atmRow.putLTP,
        callOI: atmRow.callOI,
        putOI: atmRow.putOI,
        callIV: atmRow.callIV,
        putIV: atmRow.putIV,
        callVolume: atmRow.callVolume,
        putVolume: atmRow.putVolume,
        straddle: atmRow.callLTP !== null && atmRow.putLTP !== null
          ? Math.round((atmRow.callLTP + atmRow.putLTP) * 100) / 100
          : null,
      };
    }
  }

  // IV skew: average call IV vs put IV for near-ATM strikes
  const nearATMRows = rows.filter(
    (r) => summary.atmStrike && Math.abs(r.strike - summary.atmStrike) <= 500 && r.callIV !== null && r.putIV !== null
  );
  let avgCallIV = null;
  let avgPutIV = null;
  if (nearATMRows.length > 0) {
    avgCallIV = Math.round((nearATMRows.reduce((s, r) => s + r.callIV, 0) / nearATMRows.length) * 100) / 100;
    avgPutIV = Math.round((nearATMRows.reduce((s, r) => s + r.putIV, 0) / nearATMRows.length) * 100) / 100;
  }

  return {
    callOIBuildup,
    putOIBuildup,
    callOIWriting,
    putOIWriting,
    callOIUnwinding,
    putOIUnwinding,
    resistanceLevels,
    supportLevels,
    atmSummary,
    ivSkew: { avgCallIV, avgPutIV },
    pcr: summary.pcr,
  };
}

// --- Available Expiries & Indices (mock for now) ---

export function getAvailableExpiries() {
  return ['10-Mar-2026', '17-Mar-2026', '24-Mar-2026', '31-Mar-2026'];
}

export function getAvailableIndices() {
  return ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];
}

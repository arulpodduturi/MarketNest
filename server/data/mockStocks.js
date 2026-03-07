// Mock Indian Stock Market Data
// Replace with real Yahoo Finance / NSE API integration later

export const marketIndices = [
  {
    symbol: 'NIFTY50',
    name: 'NIFTY 50',
    value: 22347.80,
    change: +142.35,
    changePercent: +0.64,
  },
  {
    symbol: 'BANKNIFTY',
    name: 'BANK NIFTY',
    value: 47562.10,
    change: -87.45,
    changePercent: -0.18,
  },
  {
    symbol: 'SENSEX',
    name: 'SENSEX',
    value: 73648.62,
    change: +468.30,
    changePercent: +0.64,
  },
];

export const stocks = [
  {
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Ltd.',
    ltp: 2467.55,
    change: +32.10,
    changePercent: +1.32,
    open: 2440.00,
    high: 2478.90,
    low: 2435.20,
    prevClose: 2435.45,
    volume: 8423150,
    sector: 'Oil & Gas',
  },
  {
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services Ltd.',
    ltp: 3612.40,
    change: -28.75,
    changePercent: -0.79,
    open: 3645.00,
    high: 3658.30,
    low: 3598.10,
    prevClose: 3641.15,
    volume: 3215640,
    sector: 'IT',
  },
  {
    symbol: 'INFY',
    companyName: 'Infosys Ltd.',
    ltp: 1548.25,
    change: +18.60,
    changePercent: +1.22,
    open: 1532.00,
    high: 1556.70,
    low: 1528.45,
    prevClose: 1529.65,
    volume: 6547820,
    sector: 'IT',
  },
  {
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Ltd.',
    ltp: 1652.30,
    change: +12.45,
    changePercent: +0.76,
    open: 1642.00,
    high: 1660.80,
    low: 1638.50,
    prevClose: 1639.85,
    volume: 9125340,
    sector: 'Banking',
  },
  {
    symbol: 'ICICIBANK',
    companyName: 'ICICI Bank Ltd.',
    ltp: 1053.70,
    change: -8.30,
    changePercent: -0.78,
    open: 1065.00,
    high: 1068.40,
    low: 1048.90,
    prevClose: 1062.00,
    volume: 7823100,
    sector: 'Banking',
  },
  {
    symbol: 'SBIN',
    companyName: 'State Bank of India',
    ltp: 622.85,
    change: +9.15,
    changePercent: +1.49,
    open: 615.00,
    high: 628.30,
    low: 613.20,
    prevClose: 613.70,
    volume: 15432600,
    sector: 'Banking',
  },
  {
    symbol: 'LT',
    companyName: 'Larsen & Toubro Ltd.',
    ltp: 3215.60,
    change: -45.20,
    changePercent: -1.39,
    open: 3268.00,
    high: 3275.40,
    low: 3208.10,
    prevClose: 3260.80,
    volume: 2145870,
    sector: 'Infrastructure',
  },
  {
    symbol: 'AXISBANK',
    companyName: 'Axis Bank Ltd.',
    ltp: 1102.45,
    change: +15.80,
    changePercent: +1.45,
    open: 1088.00,
    high: 1110.20,
    low: 1085.30,
    prevClose: 1086.65,
    volume: 5678230,
    sector: 'Banking',
  },
  {
    symbol: 'ADANIPORTS',
    companyName: 'Adani Ports & SEZ Ltd.',
    ltp: 852.30,
    change: -12.65,
    changePercent: -1.46,
    open: 868.00,
    high: 872.50,
    low: 848.10,
    prevClose: 864.95,
    volume: 4321560,
    sector: 'Infrastructure',
  },
  {
    symbol: 'BAJFINANCE',
    companyName: 'Bajaj Finance Ltd.',
    ltp: 7234.50,
    change: +98.70,
    changePercent: +1.38,
    open: 7148.00,
    high: 7268.90,
    low: 7132.40,
    prevClose: 7135.80,
    volume: 1876540,
    sector: 'Finance',
  },
];

// Helper: get top gainers (sorted by changePercent descending)
export const getTopGainers = (count = 5) => {
  return [...stocks]
    .filter((s) => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, count);
};

// Helper: get top losers (sorted by changePercent ascending)
export const getTopLosers = (count = 5) => {
  return [...stocks]
    .filter((s) => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, count);
};

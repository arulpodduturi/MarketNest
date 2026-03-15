import axios from 'axios';

const API_BASE = '/api/fno';

// Future: Replace with real NSE / live data integration

export const fetchOptionChain = async ({ index = 'NIFTY', expiry = '10-Mar-2026', nearATM = false, range = 15 } = {}) => {
  const params = { index, expiry };
  if (nearATM) {
    params.nearATM = 'true';
    params.range = range;
  }
  const res = await axios.get(`${API_BASE}/option-chain`, { params });
  return res.data;
};

export const fetchFNOSummary = async ({ index = 'NIFTY', expiry = '10-Mar-2026' } = {}) => {
  const res = await axios.get(`${API_BASE}/summary`, { params: { index, expiry } });
  return res.data;
};

export const fetchFNOAnalytics = async ({ index = 'NIFTY', expiry = '10-Mar-2026' } = {}) => {
  const res = await axios.get(`${API_BASE}/analytics`, { params: { index, expiry } });
  return res.data;
};

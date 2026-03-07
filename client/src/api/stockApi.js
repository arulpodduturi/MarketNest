import axios from 'axios';

const API_BASE = '/api';

// Future: Replace with real Yahoo Finance / NSE API integration

export const fetchAllStocks = async () => {
  const res = await axios.get(`${API_BASE}/stocks`);
  return res.data;
};

export const fetchStockBySymbol = async (symbol) => {
  const res = await axios.get(`${API_BASE}/stocks/${symbol}`);
  return res.data;
};

export const fetchMarketIndices = async () => {
  const res = await axios.get(`${API_BASE}/stocks/indices/all`);
  return res.data;
};

export const fetchTopGainers = async () => {
  const res = await axios.get(`${API_BASE}/stocks/gainers/top`);
  return res.data;
};

export const fetchTopLosers = async () => {
  const res = await axios.get(`${API_BASE}/stocks/losers/top`);
  return res.data;
};

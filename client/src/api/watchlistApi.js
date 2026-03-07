import axios from 'axios';

const API_BASE = '/api/watchlist';

export const fetchWatchlist = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};

export const addToWatchlist = async (stock) => {
  const res = await axios.post(API_BASE, stock);
  return res.data;
};

export const removeFromWatchlist = async (symbol) => {
  const res = await axios.delete(`${API_BASE}/${symbol}`);
  return res.data;
};

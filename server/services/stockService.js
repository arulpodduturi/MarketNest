import { stocks, marketIndices, getTopGainers, getTopLosers } from '../data/mockStocks.js';

// Future: Replace mock data with real Yahoo Finance / NSE API calls

export const getAllStocks = () => {
  return stocks;
};

export const getStockBySymbol = (symbol) => {
  return stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase()) || null;
};

export const getIndices = () => {
  return marketIndices;
};

export const getGainers = (count = 5) => {
  return getTopGainers(count);
};

export const getLosers = (count = 5) => {
  return getTopLosers(count);
};

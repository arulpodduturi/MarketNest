import * as stockService from '../services/stockService.js';

// GET /api/stocks
export const getAllStocks = (req, res) => {
  try {
    const stocks = stockService.getAllStocks();
    res.json({ success: true, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/stocks/:symbol
export const getStockBySymbol = (req, res) => {
  try {
    const stock = stockService.getStockBySymbol(req.params.symbol);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/stocks/indices/all
export const getMarketIndices = (req, res) => {
  try {
    const indices = stockService.getIndices();
    res.json({ success: true, data: indices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/stocks/gainers/top
export const getTopGainers = (req, res) => {
  try {
    const gainers = stockService.getGainers(5);
    res.json({ success: true, data: gainers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/stocks/losers/top
export const getTopLosers = (req, res) => {
  try {
    const losers = stockService.getLosers(5);
    res.json({ success: true, data: losers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

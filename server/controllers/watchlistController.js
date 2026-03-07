import Watchlist from '../models/Watchlist.js';

// GET /api/watchlist
export const getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/watchlist
export const addToWatchlist = async (req, res) => {
  try {
    const { symbol, companyName, price, change, changePercent } = req.body;

    if (!symbol || !companyName) {
      return res.status(400).json({ success: false, message: 'Symbol and company name are required' });
    }

    const exists = await Watchlist.findOne({ symbol: symbol.toUpperCase() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Stock already in watchlist' });
    }

    const item = await Watchlist.create({
      symbol: symbol.toUpperCase(),
      companyName,
      price: price || 0,
      change: change || 0,
      changePercent: changePercent || 0,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/watchlist/:symbol
export const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;
    const item = await Watchlist.findOneAndDelete({ symbol: symbol.toUpperCase() });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Stock not found in watchlist' });
    }

    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

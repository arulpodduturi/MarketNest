import mongoose from 'mongoose';
import Watchlist from '../models/Watchlist.js';

// --- In-memory fallback storage when MongoDB is unavailable ---
const memoryStore = [];

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// GET /api/watchlist
export const getWatchlist = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const items = await Watchlist.find().sort({ createdAt: -1 });
      return res.json({ success: true, data: items });
    }
    // Fallback: return in-memory list
    const sorted = [...memoryStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: sorted });
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

    if (isMongoConnected()) {
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

      return res.status(201).json({ success: true, data: item });
    }

    // Fallback: use in-memory store
    const upperSymbol = symbol.toUpperCase();
    const exists = memoryStore.find((i) => i.symbol === upperSymbol);
    if (exists) {
      return res.status(409).json({ success: false, message: 'Stock already in watchlist' });
    }

    const item = {
      _id: Date.now().toString(),
      symbol: upperSymbol,
      companyName,
      price: price || 0,
      change: change || 0,
      changePercent: changePercent || 0,
      createdAt: new Date().toISOString(),
    };
    memoryStore.push(item);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/watchlist/:symbol
export const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (isMongoConnected()) {
      const item = await Watchlist.findOneAndDelete({ symbol: symbol.toUpperCase() });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Stock not found in watchlist' });
      }
      return res.json({ success: true, message: 'Removed from watchlist' });
    }

    // Fallback: remove from in-memory store
    const upperSymbol = symbol.toUpperCase();
    const idx = memoryStore.findIndex((i) => i.symbol === upperSymbol);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Stock not found in watchlist' });
    }
    memoryStore.splice(idx, 1);
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

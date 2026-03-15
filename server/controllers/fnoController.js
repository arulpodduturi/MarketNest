import * as fnoService from '../services/fnoService.js';

// GET /api/fno/option-chain?index=NIFTY&expiry=10-Mar-2026&nearATM=true&range=10
export const getOptionChain = (req, res) => {
  try {
    const { index = 'NIFTY', expiry = '10-Mar-2026', nearATM, range } = req.query;
    let rows = fnoService.getOptionChainRows(index, expiry);

    if (!rows || !rows.length) {
      return res.status(404).json({ success: false, message: 'No option chain data found' });
    }

    // If nearATM=true, filter to nearby strikes around ATM
    if (nearATM === 'true') {
      const summary = fnoService.getSummary(index, expiry);
      if (summary && summary.atmStrike) {
        const strikeRange = parseInt(range) || 15;
        const atmIdx = rows.findIndex((r) => r.strike === summary.atmStrike);
        if (atmIdx >= 0) {
          const start = Math.max(0, atmIdx - strikeRange);
          const end = Math.min(rows.length, atmIdx + strikeRange + 1);
          rows = rows.slice(start, end);
        }
      }
    }

    res.json({
      success: true,
      data: rows,
      meta: {
        index,
        expiry,
        totalRows: rows.length,
        availableExpiries: fnoService.getAvailableExpiries(),
        availableIndices: fnoService.getAvailableIndices(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/fno/summary?index=NIFTY&expiry=10-Mar-2026
export const getSummary = (req, res) => {
  try {
    const { index = 'NIFTY', expiry = '10-Mar-2026' } = req.query;
    const summary = fnoService.getSummary(index, expiry);

    if (!summary) {
      return res.status(404).json({ success: false, message: 'No summary data found' });
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/fno/analytics?index=NIFTY&expiry=10-Mar-2026
export const getAnalytics = (req, res) => {
  try {
    const { index = 'NIFTY', expiry = '10-Mar-2026' } = req.query;
    const analytics = fnoService.getAnalytics(index, expiry);

    if (!analytics) {
      return res.status(404).json({ success: false, message: 'No analytics data found' });
    }

    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

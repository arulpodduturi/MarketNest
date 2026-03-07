import express from 'express';
import {
  getAllStocks,
  getStockBySymbol,
  getMarketIndices,
  getTopGainers,
  getTopLosers,
} from '../controllers/stockController.js';

const router = express.Router();

// These specific routes must come before the :symbol param route
router.get('/indices/all', getMarketIndices);
router.get('/gainers/top', getTopGainers);
router.get('/losers/top', getTopLosers);

router.get('/', getAllStocks);
router.get('/:symbol', getStockBySymbol);

export default router;

import express from 'express';
import { getOptionChain, getSummary, getAnalytics } from '../controllers/fnoController.js';

const router = express.Router();

router.get('/option-chain', getOptionChain);
router.get('/summary', getSummary);
router.get('/analytics', getAnalytics);

export default router;

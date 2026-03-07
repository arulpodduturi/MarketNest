import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import stockRoutes from './routes/stockRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/watchlist', watchlistRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MarketNest API is running' });
});

// Start server, then attempt MongoDB connection
app.listen(PORT, () => {
  console.log(`MarketNest server running on port ${PORT}`);
});

// Attempt MongoDB connection (server works without it using mock data for stocks)
connectDB().catch(() => {
  console.warn('MongoDB not available — watchlist features will be unavailable. Stock APIs use mock data and will work fine.');
});

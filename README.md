# MarketNest — Indian Stock Market Dashboard

A premium dark-themed Indian stock market dashboard built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Features

- **Dashboard** — Summary cards (NIFTY 50, BANK NIFTY, SENSEX), top gainers/losers, stock table, watchlist panel
- **Stock Details** — LTP, change, high/low, volume, sector, chart placeholder, add to watchlist
- **Watchlist** — Save/remove stocks, persistent via MongoDB
- **Charts** — Placeholder page for future TradingView / Recharts integration
- **Dark Trading UI** — Navy/black background, card layout, green/red indicators, blue highlights

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18, Tailwind CSS 3, Vite 5   |
| Backend  | Node.js, Express 4                  |
| Database | MongoDB (Mongoose)                  |
| Icons    | Lucide React                        |
| Routing  | React Router 6                      |

## Project Structure

```
MarketNest/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios API layer
│   │   ├── components/     # Reusable UI components
│   │   ├── layouts/        # Dashboard layout
│   │   └── pages/          # Route pages
│   └── ...
├── server/                 # Express backend
│   ├── config/             # DB connection
│   ├── controllers/        # Route handlers
│   ├── data/               # Mock stock data
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── services/           # Business logic
└── package.json            # Root scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://localhost:27017/marketnest`)

### Install Dependencies

```bash
# Install root + concurrently
npm install

# Install client and server dependencies
npm run install:all
```

### Run Development Servers

```bash
# Run both frontend (port 3000) and backend (port 5000) together
npm run dev

# Or run them separately
npm run dev:client    # Frontend only
npm run dev:server    # Backend only
```

### API Endpoints

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| GET    | /api/stocks            | All stocks           |
| GET    | /api/stocks/:symbol    | Stock by symbol      |
| GET    | /api/stocks/indices/all| Market indices       |
| GET    | /api/stocks/gainers/top| Top gainers          |
| GET    | /api/stocks/losers/top | Top losers           |
| GET    | /api/watchlist         | Get watchlist        |
| POST   | /api/watchlist         | Add to watchlist     |
| DELETE | /api/watchlist/:symbol | Remove from watchlist|

## Future Enhancements

- Yahoo Finance / NSE real-time data integration
- TradingView charting widget
- Options analytics (PCR, max pain, OI data)
- User authentication
- Alerts and notifications

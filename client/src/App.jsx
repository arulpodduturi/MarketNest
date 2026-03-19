import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import StockDetails from './pages/StockDetails';
import Watchlist from './pages/Watchlist';
import Charts from './pages/Charts';
import FNO from './pages/FNO';
import OIAnalysisPage from './pages/OIAnalysisPage';
import NotFound from './pages/NotFound';

const App = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <Routes>
      <Route element={<DashboardLayout onRefresh={handleRefresh} />}>
        <Route path="/" element={<Dashboard refreshKey={refreshKey} />} />
        <Route path="/stock/:symbol" element={<StockDetails />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/fno" element={<FNO />} />
        <Route path="/oi-analysis" element={<OIAnalysisPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;

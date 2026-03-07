import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = ({ onRefresh }) => {
  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <div className="ml-64">
        <Topbar onRefresh={onRefresh} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

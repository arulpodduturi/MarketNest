import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <h1 className="text-6xl font-bold text-dark-700">404</h1>
      <p className="text-lg text-dark-400">Page not found</p>
      <p className="text-sm text-dark-500 max-w-md text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotFound;

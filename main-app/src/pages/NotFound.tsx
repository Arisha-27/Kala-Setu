import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
        <p className="mb-6 text-xl text-gray-600">The page you're looking for doesn't exist.</p>
        {/* Use Link instead of <a> to stay within the React App */}
        <Link 
          to="/" 
          className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Back to Main Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
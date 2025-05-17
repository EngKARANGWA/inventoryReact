import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      
      <div className="text-center max-w-md">
        <div className="bg-blue-100 p-6 rounded-full inline-flex mb-8">
          <Search className="h-16 w-16 text-blue-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
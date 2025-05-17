
import React from 'react';
import Sidebar from '../components/ui/sidebar';
import { LogOut, BellIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                  <BellIcon className="h-6 w-6" />
                </button>
                
                {/* User Dropdown */}
                <div className="relative inline-block text-left">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <span className="text-green-500 font-medium">
                        {(user?.fullName || user?.username || 'U').split(' ')
                          .map(part => part[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                    </div>
                    <span className="text-gray-700 text-sm font-medium hidden md:block">
                      {user?.fullName || user?.username || 'User'}
                    </span>
                  </div>
                </div>
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 flex items-center"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Ihirwe Trading Co. Ltd. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
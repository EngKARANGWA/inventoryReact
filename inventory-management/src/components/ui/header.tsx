import React, { useState } from 'react';
import { Bell, User, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New order received', time: '2 min ago' },
    { id: 2, message: 'Inventory updated', time: '1 hour ago' },
    { id: 3, message: 'Low stock alert', time: '3 hours ago' },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleViewAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side menu button (if needed) */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
          >
            {/* Menu icon would go here */}
          </button>

          {/* Right Side Icons - positioned at the far right */}
          <div className="ml-auto flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfile(false);
                }}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                          >
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No new notifications
                      </div>
                    )}
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button 
                        onClick={handleViewAllNotifications}
                        className="text-sm text-green-500 hover:text-green-600"
                      >
                        {notifications.length > 0 ? 'Clear all notifications' : 'View all notifications'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfile(!showProfile);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2 p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <a
                      href="#profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="#settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </a>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={() => {
                          localStorage.removeItem('user');
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
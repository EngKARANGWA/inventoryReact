/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { LogOut, UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { logout, getCurrentUser } from "../../services/authService";
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Get user data when component mounts
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Redirect to login page after successful logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local storage and redirect
      localStorage.clear();
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const nameParts = user.name?.split(" ") || [];
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 w-full sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side content (if needed) */}
          <div className="flex-shrink-0">
            {/* Logo or app name can go here */}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative ml-3">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2 max-w-xs rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-expanded={showProfile}
                aria-haspopup="true"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                  {getUserInitials()}
                </div>
                <span className="sr-only">Open user menu</span>
                {showProfile ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {/* Profile Dropdown */}
              {showProfile && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50">
                  <div className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "No email"}
                    </p>
                    {user?.role && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {user.role}
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard/profile"
                      className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <UserCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      Your Profile
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={`w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${
                        isLoggingOut ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      <LogOut className="mr-3 h-5 w-5 text-red-400" />
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
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

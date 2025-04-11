import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  // Settings, 
  Menu, 
  X,
  // ShoppingCart,
  // FileText,
  // BarChart3,
  // Bell,
  Building,
  Target,
  RefreshCcw,
  ArrowLeftRight
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  // { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Warehouses', href: '/dashboard/warehouses', icon: Building },
  { name: 'Production(Batches)', href: '/dashboard/productions', icon: Target },
  { name: 'Returns', href: '/dashboard/returns', icon: RefreshCcw },
  { name: 'Transfers', href: '/dashboard/transfers', icon: ArrowLeftRight },
  // { name: 'Sales', href: '/dashboard/sales', icon: ShoppingCart },
  // { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  // { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  // { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  // { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md hover:bg-gray-100 transition-colors"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-green-500"> IHIRWE TRADING CO. LTD</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-green-500 text-white'
                      : 'text-gray-600 hover:bg-green-500 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-500 font-medium">JD</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">John Doe</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}; 
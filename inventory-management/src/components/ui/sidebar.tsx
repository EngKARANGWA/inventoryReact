import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Menu, 
  X,
  ShoppingCart,
  Target,
  RefreshCcw,
  ArrowLeftRight,
  Truck,
  Trash2Icon,
  Warehouse,
  Boxes,
  HandCoins,
  Banknote,
  Settings,
} from 'lucide-react';
import { getCurrentUser } from "../../services/authService";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowedRoles?: string[];
}

// Define all possible navigation items with their required roles
const allNavigationItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Purchases', 
    href: '/dashboard/purchases', 
    icon: HandCoins,
    allowedRoles: ['ADMIN', 'MANAGER', 'SALER']
  },
  { 
    name: 'Payments', 
    href: '/dashboard/payments', 
    icon: Banknote,
    allowedRoles: ['ADMIN', 'MANAGER', 'CASHIER']
  },
  { 
    name: 'Deliveries', 
    href: '/dashboard/deliveries', 
    icon: Truck,
    allowedRoles: ['ADMIN', 'MANAGER', 'DRIVER']
  },
  { 
    name: 'Production(Batches)', 
    href: '/dashboard/productions', 
    icon: Target,
    allowedRoles: ['ADMIN', 'MANAGER', 'PRODUCTIONMANAGER']
  },
  { 
    name: 'Sales', 
    href: '/dashboard/sales', 
    icon: ShoppingCart,
    allowedRoles: ['ADMIN', 'MANAGER', 'SALER', 'CASHIER']
  },
  { 
    name: 'Returns', 
    href: '/dashboard/returns', 
    icon: RefreshCcw,
    allowedRoles: ['ADMIN', 'MANAGER', 'STOCKKEEPER']
  },
  { 
    name: 'Transfers', 
    href: '/dashboard/transfers', 
    icon: ArrowLeftRight,
    allowedRoles: ['ADMIN', 'MANAGER', 'STOCKKEEPER', 'DRIVER']
  },
  { 
    name: 'Disposals', 
    href: '/dashboard/disposals', 
    icon: Trash2Icon,
    allowedRoles: ['ADMIN', 'MANAGER', 'STOCKKEEPER']
  },
  { 
    name: 'Products', 
    href: '/dashboard/products', 
    icon: Package 
  },
  { 
    name: 'Stock', 
    href: '/dashboard/stock', 
    icon: Boxes,
    allowedRoles: ['ADMIN', 'MANAGER', 'STOCKKEEPER']
  },
  { 
    name: 'Warehouses', 
    href: '/dashboard/warehouses', 
    icon: Warehouse,
    allowedRoles: ['ADMIN', 'MANAGER']
  },
  { 
    name: 'Users', 
    href: '/dashboard/users', 
    icon: Users,
    allowedRoles: ['ADMIN']
  },
  {
    name: 'Setting',
    href: '/dashboard/profile',
    icon: Settings,
    allowedRoles: ['MANAGER','DRIVER','STOCKKEEPER','SALER','CASHIER','PRODUCTIONMANAGER']

  }
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [filteredNavigation, setFilteredNavigation] = useState<NavItem[]>([]);
  const location = useLocation();

  useEffect(() => {
    // Get user data when component mounts
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user) {
      // Filter navigation based on user roles
      const userRoles = user.roles || [];
      
      const filtered = allNavigationItems.filter(item => {
        // If no allowedRoles specified, the item is available to all authenticated users
        if (!item.allowedRoles) return true;
        
        // Check if user has any of the required roles
        return item.allowedRoles.some(role => userRoles.includes(role));
      });
      
      setFilteredNavigation(filtered);
    }
  }, [user]);

  const getUserInitials = () => {
    if (!user) return "U";
    const nameParts = user.name?.split(" ") || [];
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
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
            <h1 className="text-xl font-bold text-green-500">IHIRWE TRADING CO. LTD</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
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
                {user?.avatar ? (
                  <img 
                    className="h-10 w-10 rounded-full" 
                    src={user.avatar} 
                    alt={`${user.name}'s avatar`}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user?.username || "Loading..."}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "Loading..."}
                </p>
                {user?.roles?.map((role: string) => (
                  <span 
                    key={role}
                    className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full mr-1"
                  >
                    {role}
                  </span>
                ))}
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
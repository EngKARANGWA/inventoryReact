import { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  Tag, 
  Warehouse, 
  ShoppingCart, 
  CreditCard, 
  BarChart2,
  Users,
  Settings,
  LogOut,
  Factory,
  Truck,
  ChevronDown
} from 'lucide-react';
import './ToolBar.css';

// Define available user roles
const userRoles = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  PRODUCTION: 'production',
  SUPPLIER: 'supplier'
};

// Define navigation items per role
const navigationConfig = {
  [userRoles.ADMIN]: [
    { title: 'Dashboard', path: '/dashboard', icon: <Home className="icon" /> },
    { title: 'Product', path: '/product', icon: <Package className="icon" /> },
    { title: 'Sales', path: '/sales', icon: <Tag className="icon" /> },
    { title: 'Inventory', path: '/inventory', icon: <Warehouse className="icon" /> },
    { title: 'Purchases', path: '/purchases', icon: <ShoppingCart className="icon" /> },
    { title: 'Payments', path: '/payments', icon: <CreditCard className="icon" /> },
    { title: 'Report', path: '/report', icon: <BarChart2 className="icon" /> },
    { title: 'Users', path: '/users', icon: <Users className="icon" /> },
    { title: 'Settings', path: '/settings', icon: <Settings className="icon" /> },
  ],
  [userRoles.CASHIER]: [
    { title: 'Dashboard', path: '/dashboard', icon: <Home className="icon" /> },
    { title: 'Sales', path: '/sales', icon: <Tag className="icon" /> },
    { title: 'Payments', path: '/paymentactions', icon: <CreditCard className="icon" /> },
  ],
  [userRoles.PRODUCTION]: [
    { title: 'Dashboard', path: '/dashboard', icon: <Home className="icon" /> },
    { title: 'Production', path: '/task', icon: <Factory className="icon" /> },
    { title: 'Inventory', path: '/inventory', icon: <Warehouse className="icon" /> },
  ],
  [userRoles.SUPPLIER]: [
    { title: 'Dashboard', path: '/dashboard', icon: <Home className="icon" /> },
    { title: 'Orders', path: '/supplier/orders', icon: <ShoppingCart className="icon" /> },
    { title: 'Deliveries', path: '/supplier/deliveries', icon: <Truck className="icon" /> },
  ],
};

const ToolBars = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedRole, setSelectedRole] = useState(userRoles.ADMIN);
  const [navItems, setNavItems] = useState(navigationConfig[userRoles.ADMIN]);

  // Handle navigation and update current path
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Update navigation items when role changes
  useEffect(() => {
    setNavItems(navigationConfig[selectedRole]);
    // Redirect to the appropriate dashboard when role changes
    if (selectedRole === userRoles.CASHIER) navigate('/dashboard');
    if (selectedRole === userRoles.ADMIN) navigate('/dashboard');
  }, [selectedRole]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="header-container">
      {/* Role Selector */}
      <div className="header-top">
        <div className="role-selector-container">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="role-selector"
          >
            <option value={userRoles.ADMIN}>Admin</option>
            <option value={userRoles.CASHIER}>Cashier</option>
            <option value={userRoles.PRODUCTION}>Production</option>
            <option value={userRoles.SUPPLIER}>Supplier</option>
          </select>
          <ChevronDown className="role-selector-icon" />
        </div>
      </div>

      {/* Role Display */}
      <div className="role-display">
        <div className="role-text">{selectedRole}</div>
      </div>
      
      {/* Dynamic Navigation */}
      <nav className="navigation">
        {navItems.map((item) => (
          <div 
            key={item.path} 
            onClick={() => navigate(item.path)}
            className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span className="nav-text">{item.title}</span>
          </div>
        ))}
      </nav>
    
      {/* Logout Section */}
      <div className="logout-section">
        <div 
          className="logout-link"
          onClick={() => navigate('/logout')}
        >
          <LogOut className="icon" />
          <span className="logout-text">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default ToolBars;
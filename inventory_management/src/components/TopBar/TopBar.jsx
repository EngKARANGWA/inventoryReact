import { Bell, User, Search } from 'lucide-react';
import './TopBar.css'; // We'll create this CSS file

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {/* Left section can be empty or used for other elements */}
      </div>
      <div className="top-bar-center">
        <h1 className="app-title">IHIRWE TRADING CO. LTD</h1>
        <div className="search-container">
          <Search className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>
      <div className="top-bar-right">
        <div className="notification-icon">
          <Bell className="bell-icon" />
          <span className="notification-badge">1</span>
        </div>
        <div className="user-avatar">
          <User className="user-icon" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
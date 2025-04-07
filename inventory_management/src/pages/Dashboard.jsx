import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">1,234</p>
        </div>
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">$45,678</p>
        </div>
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <p className="stat-value">12</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
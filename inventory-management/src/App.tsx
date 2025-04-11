import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./app/Landingpage/Landingpage";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/users/UserManagement";
import ProductManagement from "./pages/products/ProductManagement";
import "./App.css";
import WarehouseManagement from "./pages/warehouses/WarehouseManagement";
import ProductionManagement from "./pages/production/ProductionManagement";
import ReturnsManagement from "./pages/returns/ReturnsManagement";
import TransferManagement from "./pages/transfer/TransferManagement";
import SaleManagement from "./pages/sales/SalesManagement";
import DisposalManagement from "./pages/Disposal/DisposalManagement";
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LandingPage from './app/Landingpage/Landingpage';
// import Dashboard from './pages/Dashboard';
// import UserManagement from './pages/users/UserManagement';
// import ProductManagement from './pages/products/ProductManagement';
import PriceManagement from './pages/prices/PriceManagement';
import DeliveriesManagement from './pages/deliveries/DeliveriesManagement';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/products"
            element={
              <ProtectedRoute>
                <ProductManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/warehouses"
            element={
              <ProtectedRoute>
                <WarehouseManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/productions"
            element={
              <ProtectedRoute>
                <ProductionManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/returns"
            element={
              <ProtectedRoute>
                <ReturnsManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/transfers"
            element={
              <ProtectedRoute>
                <TransferManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path='/dashboard/prices'
            element={
              <ProtectedRoute>
                <PriceManagement />
              </ProtectedRoute>
            }
          />
          
          <Route
            path='/dashboard/deliveries'
            element={
              <ProtectedRoute>
                <DeliveriesManagement />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/dashboard-cashier" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

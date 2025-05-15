import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { ToastProvider, useToast } from "./components/ui/toast";
import { LoginPage } from "./app/Landingpage/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/users/UserManagement";
import ProductManagement from "./pages/products/ProductManagement";
import WarehouseManagement from "./pages/warehouses/WarehouseManagement";
import ProductionManagement from "./pages/production/ProductionManagement";
import ReturnsManagement from "./pages/returns/ReturnsManagement";
import TransferManagement from "./pages/transfer/TransferManagement";
import SaleManagement from "./pages/sales/SalesManagement";
import DisposalManagement from "./pages/Disposal/DisposalManagement";
import DeliveriesManagement from "./pages/deliveries/DeliveriesManagement";
import StockMovementManagement from "./pages/stockMovement/StockMovementManagement";
import PurchaseManagement from "./pages/purchase/PurchaseManagement";
import PaymentManagement from "./pages/payments/PaymentManagement";
import { isAuthenticated, getCurrentUser } from "./services/authService";

const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const isLoggedIn = isAuthenticated();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && allowedRoles.length > 0) {
    const currentUser = getCurrentUser();
    const userRoles = currentUser?.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user role
      if (userRoles.includes('ADMIN')) {
        return <Navigate to="/dashboard" replace />;
      } else if (userRoles.includes('CASHIER')) {
        return <Navigate to="/dashboard-cashier" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }
  
  return <>{children}</>;
};

// Guest Route component (only accessible when not logged in)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = isAuthenticated();
  
  if (isLoggedIn) {
    const currentUser = getCurrentUser();
    const userRoles = currentUser?.roles || [];
    
    if (userRoles.includes('ADMIN')) {
      return <Navigate to="/dashboard" replace />;
    } else if (userRoles.includes('CASHIER')) {
      return <Navigate to="/dashboard-cashier" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

// Toast listener component to handle global toast events
const ToastListener = () => {
  const toast = useToast();
  
  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { message, type } = customEvent.detail;
        if (type === 'success') {
          toast.success(message);
        } else if (type === 'error') {
          toast.error(message);
        } else {
          toast.info(message);
        }
      }
    };
    
    window.addEventListener('toast', handleToast);
    
    return () => {
      window.removeEventListener('toast', handleToast);
    };
  }, [toast]);
  
  return null;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Auth Routes */}
          <Route 
            path="/" 
            element={<Navigate to="/login" replace />} 
          />
          <Route 
            path="/login" 
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <GuestRoute>
                <ResetPasswordPage />
              </GuestRoute>
            } 
          />
          
          {/* Dashboard Routes */}
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
              <ProtectedRoute allowedRoles={['ADMIN']}>
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
            path="/dashboard/purchases"
            element={
              <ProtectedRoute>
                <PurchaseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/payments"
            element={
              <ProtectedRoute>
                <PaymentManagement />
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
            path="/dashboard/sales"
            element={
              <ProtectedRoute>
                <SaleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/disposals"
            element={
              <ProtectedRoute>
                <DisposalManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/stock"
            element={
              <ProtectedRoute>
                <StockMovementManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/deliveries"
            element={
              <ProtectedRoute>
                <DeliveriesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-cashier"
            element={
              <ProtectedRoute allowedRoles={['CASHIER']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppRoutes />
      <ToastListener />
    </ToastProvider>
  );
}

export default App;
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import { ToastProvider, useToast } from "./components/ui/toast";
import Dashboard from "./pages/Dashboard";
import axios from "axios";
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
import UnauthorizedPage from "./pages/errors/UnauthorizedPage";
import NotFoundPage from "./pages/errors/NotFoundPage";
import AuthPage from "./pages/auth/AuthPage";
import UserProfilepage from "./pages/profile/ProfilePage";
import SmallExpenseManagement from "./pages/SmallExpenses/SmallExpenseManagement";

// Role constants for better maintainability
const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  SALER: "SALER",
  DRIVER: "DRIVER",
  PRODUCTIONMANAGER: "PRODUCTIONMANAGER",
  SCALEMONITOR: "SCALEMONITOR",
  STOCKKEEPER: "STOCKKEEPER",
};

// Component to setup axios interceptors
const AxiosInterceptorSetup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear authentication data
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");

          // Redirect to login
          navigate("/login");

          // Show error message
          const event = new CustomEvent("toast", {
            detail: {
              message: "Your session has expired. Please login again.",
              type: "error",
            },
          });
          window.dispatchEvent(event);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return null;
};

// Protected route component
const ProtectedRoute = ({
  children,
  allowedRoles,
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
    const hasRequiredRole = allowedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Toast notification listener
const ToastListener = () => {
  const toast = useToast();

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { message, type } = customEvent.detail;
        if (type === "success") {
          toast.success(message);
        } else if (type === "error") {
          toast.error(message);
        } else {
          toast.info(message);
        }
      }
    };

    window.addEventListener("toast", handleToast);

    return () => {
      window.removeEventListener("toast", handleToast);
    };
  }, [toast]);

  return null;
};

// Main application routes
const AppRoutes = () => {
  return (
    <div className="min-h-screen">
      <AxiosInterceptorSetup />
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage initialView="login" />} />
        <Route
          path="/forgot-password"
          element={<AuthPage initialView="forgot" />}
        />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile Page Route */}
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <UserProfilepage />
            </ProtectedRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Management routes */}
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCKKEEPER]}
            >
              <ProductManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/warehouses"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
              <WarehouseManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/purchases"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SALER]}
            >
              <PurchaseManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/payments"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}
            >
              <PaymentManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/productions"
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.MANAGER,
                ROLES.PRODUCTIONMANAGER,
              ]}
            >
              <ProductionManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/returns"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCKKEEPER]}
            >
              <ReturnsManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/transfers"
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.MANAGER,
                ROLES.STOCKKEEPER,
                ROLES.DRIVER,
              ]}
            >
              <TransferManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/sales"
          element={
            <ProtectedRoute
              allowedRoles={[
                ROLES.ADMIN,
                ROLES.MANAGER,
                ROLES.SALER,
                ROLES.CASHIER,
              ]}
            >
              <SaleManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/disposals"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCKKEEPER]}
            >
              <DisposalManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/stock"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.STOCKKEEPER]}
            >
              <StockMovementManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/ptcash"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER]}
            >
              <SmallExpenseManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/deliveries"
          element={
            <ProtectedRoute
              allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.DRIVER]}
            >
              <DeliveriesManagement />
            </ProtectedRoute>
          }
        />

        {/* Role-specific dashboards */}
        <Route
          path="/dashboard-cashier"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CASHIER]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-sales"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SALER]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-production"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRODUCTIONMANAGER]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard-stock"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STOCKKEEPER]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

// Main App component
const App = () => {
  return (
    <ToastProvider>
      <Router>
        <AppRoutes />
        <ToastListener />
      </Router>
    </ToastProvider>
  );
};

export default App;
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { ToastProvider, useToast } from "./components/ui/toast";
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
import UnauthorizedPage from "./pages/errors/UnauthorizedPage";
import NotFoundPage from "./pages/errors/NotFoundPage";
import AuthPage from "./pages/auth/AuthPage";
import ProfilePage from "./pages/users/ProfilePage";

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

// const GuestRoute = ({ children }: { children: React.ReactNode }) => {
//   const isLoggedIn = isAuthenticated();

//   if (isLoggedIn) {
//     const currentUser = getCurrentUser();
//     const userRoles = currentUser?.roles || [];

//     // Redirect to appropriate dashboard based on highest privilege role
//     if (userRoles.includes(ROLES.ADMIN)) {
//       return <Navigate to="/dashboard" replace />;
//     } else if (userRoles.includes(ROLES.MANAGER)) {
//       return <Navigate to="/dashboard" replace />;
//     } else if (userRoles.includes(ROLES.CASHIER)) {
//       return <Navigate to="/dashboard-cashier" replace />;
//     } else if (userRoles.includes(ROLES.SALER)) {
//       return <Navigate to="/dashboard-sales" replace />;
//     } else if (userRoles.includes(ROLES.PRODUCTIONMANAGER)) {
//       return <Navigate to="/dashboard-production" replace />;
//     } else if (userRoles.includes(ROLES.STOCKKEEPER)) {
//       return <Navigate to="/dashboard-stock" replace />;
//     } else {
//       return <Navigate to="/dashboard" replace />;
//     }
//   }

//   return <>{children}</>;
// };

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

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen">
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
            path="/dashboard/deliveries"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.DRIVER]}
              >
                <DeliveriesManagement />
              </ProtectedRoute>
            }
          />

          {/* Profile Page Route */}
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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

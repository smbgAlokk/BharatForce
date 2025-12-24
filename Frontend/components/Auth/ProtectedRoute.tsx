import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { UserRole } from "../../types";

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // 1. Authentication Check (Your existing logic)
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authorization Check (New RBAC Logic)
  // If this route has specific roles defined (e.g., SUPER_ADMIN only)
  if (allowedRoles && currentUser) {
    if (!allowedRoles.includes(currentUser.role)) {
      console.warn(
        `⛔ Access Denied: User role ${currentUser.role} tried to access restricted route.`
      );
      // Redirect unauthorized users back to the safe Dashboard
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={["ADMIN","MANAGER"]}>
 *     <SomePage />
 *   </ProtectedRoute>
 *
 * - If not authenticated  → redirects to /login
 * - If role not allowed   → redirects to /forbidden
 * - Otherwise             → renders children
 *
 * allowedRoles is optional — if omitted, any authenticated user is allowed.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalised = allowedRoles.map((r) => r.toUpperCase());
    if (!normalised.includes(role)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

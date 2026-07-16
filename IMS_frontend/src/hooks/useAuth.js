import { useMemo } from "react";

/**
 * useAuth — single source of truth for the authenticated user's session.
 *
 * Reads from localStorage (populated on login).
 * Returns:
 *   token      — raw JWT string
 *   email      — user email
 *   fullName   — display name
 *   role       — "ADMIN" | "MANAGER" | "STAFF"
 *   isAdmin    — boolean shortcut
 *   isManager  — boolean shortcut
 *   isStaff    — boolean shortcut
 *   isAdminOrManager — boolean shortcut for write-access checks
 *   isAuthenticated  — token present
 *   hasRole(r) — checks if current role matches
 */
const useAuth = () => {
  const token    = localStorage.getItem("authToken")    || null;
  const email    = localStorage.getItem("userEmail")    || "";
  const fullName = localStorage.getItem("userFullName") || "";
  const role     = (localStorage.getItem("userRole")    || "STAFF").toUpperCase();

  return useMemo(() => ({
    token,
    email,
    fullName,
    role,
    isAuthenticated:    !!token,
    isAdmin:            role === "ADMIN",
    isManager:          role === "MANAGER",
    isStaff:            role === "STAFF",
    isAdminOrManager:   role === "ADMIN" || role === "MANAGER",
    hasRole: (r) => role === r.toUpperCase(),
  }), [token, email, fullName, role]);
};

export default useAuth;

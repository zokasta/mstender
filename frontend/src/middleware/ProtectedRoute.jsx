import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute checks for token before rendering any private route.
 * If not found, redirects to login page.
 */
export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

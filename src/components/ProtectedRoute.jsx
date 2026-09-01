import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const isAuthenticated =
    localStorage.getItem("alejoAuthenticated") === "true";

  const userRole = localStorage.getItem("alejoUserRole");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    if (userRole === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (userRole === "driver") {
      return <Navigate to="/driver-dashboard" replace />;
    }

    return <Navigate to="/customer-dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
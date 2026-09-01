import { Navigate } from "react-router-dom";

function CustomerRoute({ children }) {
  const user = localStorage.getItem("alejoUser");
  const isAdmin = localStorage.getItem("alejoAdminAuthenticated") === "true";
  const isDriver = localStorage.getItem("alejoDriverAuthenticated") === "true";

  if (user) return children;
  if (isAdmin) return <Navigate to="/admin-dashboard" replace />;
  if (isDriver) return <Navigate to="/driver-dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default CustomerRoute;
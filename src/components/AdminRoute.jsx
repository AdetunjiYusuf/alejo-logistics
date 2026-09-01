import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("alejoAdminAuthenticated");

  if (isAdmin !== "true") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;
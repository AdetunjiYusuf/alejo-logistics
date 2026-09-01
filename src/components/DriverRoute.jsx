import { Navigate } from "react-router-dom";

function DriverRoute({ children }) {
  const isDriver = localStorage.getItem("alejoDriverAuthenticated");

  if (isDriver !== "true") {
    return <Navigate to="/driver-login" replace />;
  }

  return children;
}

export default DriverRoute;
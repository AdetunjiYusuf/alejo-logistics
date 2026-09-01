import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();


const customer = localStorage.getItem("alejoUser");
const admin = localStorage.getItem("alejoAdminAuthenticated") === "true";
const driver = localStorage.getItem("alejoDriverAuthenticated") === "true";

  const handleLogout = () => {
    localStorage.removeItem("alejoUser");
    localStorage.removeItem("alejoAdminAuthenticated");
    localStorage.removeItem("alejoDriverAuthenticated");

    navigate("/login");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="navbar-logo">
        Alejo Logistics
      </Link>

      <div className="navbar-links">

        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/services">Services</Link>
        <Link to="/contact">Contact</Link>

      

        {/* LOGOUT */}
        {(customer || admin || driver) && (
          <button
            className="navbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}

        {/* LOGIN */}
        {!customer && !admin && !driver && (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register" className="navbar-register">
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;
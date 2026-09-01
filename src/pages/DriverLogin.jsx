import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDriverByEmail } from "../utils/driverStorage";
import "./DriverLogin.css";

function DriverLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const driver = getDriverByEmail(email);

    if (
      !driver ||
      driver.password !== password ||
      !driver.active
    ) {
      setError("Invalid driver email or password.");
      return;
    }

    localStorage.setItem(
      "alejoDriverAuthenticated",
      "true"
    );

    localStorage.setItem(
      "alejoCurrentDriver",
      JSON.stringify({
        id: driver.id,
        name: driver.name,
        email: driver.email,
        role: "driver",
      })
    );

    navigate("/driver-dashboard");
  };

  return (
    <div className="driver-login-page">

      <div className="driver-login-card">

        <div className="driver-login-brand">
          <div className="driver-login-logo">
            A
          </div>

          <div>
            <strong>ALEJO</strong>
            <span>LOGISTICS</span>
          </div>
        </div>

        <div className="driver-login-header">

          <p>DRIVER PORTAL</p>

          <h1>
            Driver Login
          </h1>

          <span>
            Sign in to manage your assigned deliveries.
          </span>

        </div>

        {error && (
          <div className="driver-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="driver-login-group">

            <label>
              Driver Email
            </label>

            <input
              type="email"
              placeholder="driver@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          <div className="driver-login-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          <button
            type="submit"
            className="driver-login-button"
          >
            Sign In
          </button>

        </form>

        <button
          className="driver-back"
          onClick={() => navigate("/")}
        >
          ← Back to Alejo Logistics
        </button>

      </div>

    </div>
  );
}

export default DriverLogin;
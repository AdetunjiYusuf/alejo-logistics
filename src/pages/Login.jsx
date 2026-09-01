import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  findCustomer,
  saveCurrentUser,
} from "../utils/authStorage";

import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    /* ==========================
       ADMIN LOGIN
    ========================== */

    if (
      cleanEmail ===
        "admin@alejologistics.com" &&
      cleanPassword ===
        "AlejoAdmin2026"
    ) {
      localStorage.removeItem(
        "alejoCurrentUser"
      );

      localStorage.removeItem(
        "alejoUser"
      );

      localStorage.removeItem(
        "alejoDriverAuthenticated"
      );

      localStorage.setItem(
        "alejoAdminAuthenticated",
        "true"
      );

      navigate("/admin-dashboard");

      return;
    }


    /* ==========================
       CUSTOMER LOGIN
    ========================== */

    const customer = findCustomer(
      cleanEmail,
      cleanPassword
    );

    if (!customer) {
      setError(
        "Incorrect email or password. Please check your details or create an account."
      );

      return;
    }


    /* ==========================
       REMOVE OTHER SESSIONS
    ========================== */

    localStorage.removeItem(
      "alejoAdminAuthenticated"
    );

    localStorage.removeItem(
      "alejoDriverAuthenticated"
    );

    localStorage.removeItem(
      "alejoCurrentDriver"
    );


    /* ==========================
       CREATE CUSTOMER SESSION
    ========================== */

    const currentUser = {
      id: customer.id,

      fullName:
        customer.fullName,

      email:
        customer.email,

      phone:
        customer.phone,

      role: "customer",
    };

    saveCurrentUser(
      currentUser
    );

    navigate(
      "/customer-dashboard"
    );
  };


  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <p className="auth-label">
            ALEJO LOGISTICS
          </p>

          <h1>
            Welcome Back
          </h1>

          <p>
            Login to manage your
            deliveries and account.
          </p>

        </div>


        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        <form
          onSubmit={handleLogin}
        >

          <div className="auth-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
            />

          </div>


          <div className="auth-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

          </div>


          <button
            type="submit"
            className="auth-submit"
          >
            Login
          </button>

        </form>


        <div className="auth-footer">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/register"
              )
            }
          >
            Create Account
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCustomerAccounts,
  saveCustomerAccounts,
  saveCurrentUser,
} from "../utils/authStorage";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] =
    useState("");


  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]:
        e.target.value,
    });
  };


  const handleRegister = (e) => {
    e.preventDefault();

    setError("");


    /* ==========================
       CLEAN INPUTS
    ========================== */

    const fullName =
      form.fullName.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    const phone =
      form.phone.trim();


    /* ==========================
       REQUIRED FIELDS
    ========================== */

    if (
      !fullName ||
      !email ||
      !phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }


    /* ==========================
       PASSWORD LENGTH
    ========================== */

    if (
      form.password.length < 6
    ) {
      setError(
        "Password must be at least 6 characters."
      );

      return;
    }


    /* ==========================
       PASSWORD MATCH
    ========================== */

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }


    /* ==========================
       GET ACCOUNTS
    ========================== */

    const accounts =
      getCustomerAccounts();


    /* ==========================
       CHECK EXISTING ACCOUNT
    ========================== */

    const existingAccount =
      accounts.find(
        (account) =>
          String(
            account.email || ""
          )
            .trim()
            .toLowerCase() ===
          email
      );


    if (existingAccount) {
      setError(
        "An account with this email already exists."
      );

      return;
    }


    /* ==========================
       CREATE ACCOUNT
    ========================== */

    const newAccount = {
      id: `CUS-${Date.now()}`,

      fullName,

      email,

      phone,

      password:
        form.password,

      role: "customer",

      createdAt:
        new Date().toISOString(),

      status: "Active",

      walletBalance: 0,
    };


    /* ==========================
       SAVE ACCOUNT
    ========================== */

    const saved =
      saveCustomerAccounts([
        ...accounts,
        newAccount,
      ]);


    if (!saved) {
      setError(
        "Could not create your account. Please try again."
      );

      return;
    }


    /* ==========================
       CREATE SESSION
    ========================== */

    saveCurrentUser({
      id: newAccount.id,

      fullName:
        newAccount.fullName,

      email:
        newAccount.email,

      phone:
        newAccount.phone,

      role: "customer",
    });


    /* ==========================
       GO TO DASHBOARD
    ========================== */

    navigate(
      "/customer-dashboard"
    );
  };


  return (
    <div className="register-page">

      {/* LEFT SIDE */}

      <div className="register-intro">

        <div className="register-brand">

          <span className="register-logo">
            A
          </span>

          <div>

            <strong>
              ALEJO
            </strong>

            <span>
              LOGISTICS
            </span>

          </div>

        </div>


        <div className="register-intro-content">

          <p className="register-kicker">
            JOIN ALEJO LOGISTICS
          </p>

          <h1>
            Deliveries made
            <span> simple.</span>
          </h1>

          <p>
            Create your account and
            manage your deliveries
            from one convenient place.
          </p>


          <div className="register-benefits">

            <div>
              <span>✓</span>

              <p>
                Book deliveries easily
              </p>
            </div>


            <div>
              <span>✓</span>

              <p>
                Track your packages
              </p>
            </div>


            <div>
              <span>✓</span>

              <p>
                Manage your delivery
                history
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* FORM SIDE */}

      <div className="register-form-side">

        <div className="register-card">

          <div className="register-card-header">

            <p>
              CUSTOMER ACCOUNT
            </p>

            <h2>
              Create your account
            </h2>

            <span>
              Enter your details to
              get started.
            </span>

          </div>


          {error && (
            <div className="register-error">
              {error}
            </div>
          )}


          <form
            onSubmit={
              handleRegister
            }
          >

            {/* FULL NAME */}

            <div className="register-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={
                  form.fullName
                }
                onChange={
                  handleChange
                }
              />

            </div>


            {/* EMAIL + PHONE */}

            <div className="register-row">

              <div className="register-group">

                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              <div className="register-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="080..."
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>


            {/* PASSWORDS */}

            <div className="register-row">

              <div className="register-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={
                    form.password
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              <div className="register-group">

                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={
                    form.confirmPassword
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </div>


            <button
              type="submit"
              className="register-submit"
            >
              Create Customer Account
            </button>

          </form>


          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/login"
                )
              }
            >
              Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;
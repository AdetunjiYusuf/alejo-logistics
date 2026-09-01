import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  getCurrentUser,
  logoutUser,
} from "../utils/authStorage";

import {
  getDeliveries,
} from "../utils/deliveryStorage";

import "./CustomerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [deliveries, setDeliveries] = useState([]);

  // ==========================================
  // PROTECT PAGE
  // ==========================================

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);

    loadCustomerDeliveries(currentUser);
  }, [navigate]);

  // ==========================================
  // LOAD CUSTOMER DELIVERIES
  // ==========================================

  const loadCustomerDeliveries = (currentUser) => {
    const allDeliveries = getDeliveries();

    const customerDeliveries =
      allDeliveries.filter(
        (delivery) =>
          delivery.customerId === currentUser.id ||
          delivery.customerEmail ===
            currentUser.email
      );

    setDeliveries(customerDeliveries);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    return (
      status
        ?.toLowerCase()
        .replace(/\s+/g, "-") ||
      "pending"
    );
  };

  // ==========================================
  // PAYMENT CLASS
  // ==========================================

  const getPaymentClass = (status) => {
    if (status === "Paid") {
      return "payment-paid";
    }

    if (status === "Cash to Collect") {
      return "payment-cash";
    }

    if (
      status === "Awaiting Payment" ||
      status === "Pending"
    ) {
      return "payment-unpaid";
    }

    return "payment-unpaid";
  };

  // ==========================================
  // ACTIVE DELIVERIES
  // ==========================================

  const activeDeliveries =
    deliveries.filter(
      (delivery) =>
        delivery.status !== "Delivered" &&
        delivery.status !== "Cancelled" &&
        delivery.status !== "Rejected"
    );

  // ==========================================
  // COMPLETED DELIVERIES
  // ==========================================

  const completedDeliveries =
    deliveries.filter(
      (delivery) =>
        delivery.status === "Delivered"
    );

  // ==========================================
  // TOTAL SPENT
  // ==========================================

  const totalSpent =
    deliveries.reduce(
      (total, delivery) =>
        total +
        Number(
          delivery.totalPrice ||
            delivery.deliveryPrice ||
            delivery.price ||
            0
        ),
      0
    );

  return (
    <div className="customer-page">

      {/* HEADER */}

      <header className="customer-header">

        <div>

          <p className="customer-label">
            ALEJO LOGISTICS
          </p>

          <h1>
            Customer Dashboard
          </h1>

          <p>
            Welcome back{" "}
            <strong>
              {user?.fullName ||
                user?.name ||
                "Customer"}
            </strong>
          </p>

        </div>

        <div className="customer-header-actions">

          <button
            className="book-delivery-btn"
            onClick={() =>
              navigate("/book-delivery")
            }
          >
            + Book Delivery
          </button>

          <button
            className="customer-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* QUICK STATS */}

      <section className="customer-stats">

        <div className="customer-stat">
          <span>
            Total Deliveries
          </span>

          <strong>
            {deliveries.length}
          </strong>
        </div>

        <div className="customer-stat">
          <span>
            Active Deliveries
          </span>

          <strong>
            {activeDeliveries.length}
          </strong>
        </div>

        <div className="customer-stat">
          <span>
            Completed
          </span>

          <strong>
            {completedDeliveries.length}
          </strong>
        </div>

        <div className="customer-stat">
          <span>
            Total Spent
          </span>

          <strong>
            ₦{totalSpent.toLocaleString()}
          </strong>
        </div>

      </section>

      {/* MAIN */}

      <main className="customer-content">

        {/* WELCOME */}

        <section className="customer-welcome">

          <div>

            <p className="customer-label">
              YOUR ACCOUNT
            </p>

            <h2>
              Manage your deliveries
            </h2>

            <p>
              Book a new delivery, track your
              packages, and view your delivery
              history.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/book-delivery")
            }
          >
            Book a Delivery
          </button>

        </section>

        {/* DASHBOARD LINKS */}

        <div className="customer-dashboard-links">

          <Link
            to="/profile"
            className="dashboard-link-card"
          >
            <span>
              👤
            </span>

            <div>
              <h3>
                My Profile
              </h3>

              <p>
                View and update your account
              </p>
            </div>
          </Link>

          <a
            href="#my-deliveries"
            className="dashboard-link-card"
          >
            <span>
              📦
            </span>

            <div>
              <h3>
                My Deliveries
              </h3>

              <p>
                View your delivery history
              </p>
            </div>
          </a>

          <Link
            to="/track-delivery"
            className="dashboard-link-card"
          >
            <span>
              🚚
            </span>

            <div>
              <h3>
                Track Delivery
              </h3>

              <p>
                Track your current delivery
              </p>
            </div>
          </Link>

        </div>

        {/* ACTIVE DELIVERIES */}

        <section
          className="customer-section"
          id="my-deliveries"
        >

          <div className="customer-section-header">

            <div>

              <p className="customer-label">
                CURRENT ORDERS
              </p>

              <h2>
                My Deliveries
              </h2>

            </div>

            <span>
              {activeDeliveries.length} active
            </span>

          </div>

          {activeDeliveries.length === 0 ? (

            <div className="customer-empty">

              <div>
                📦
              </div>

              <h3>
                No active deliveries
              </h3>

              <p>
                Your current deliveries will
                appear here.
              </p>

              <button
                onClick={() =>
                  navigate("/book-delivery")
                }
              >
                Book a Delivery Now
              </button>

            </div>

          ) : (

            <div className="customer-deliveries">

              {activeDeliveries.map(
                (delivery) => (

                  <div
                    className="customer-delivery-card"
                    key={delivery.id}
                  >

                    <div className="delivery-card-top">

                      <div>

                        <strong>
                          {delivery.id}
                        </strong>

                        <small>
                          {delivery.createdAt
                            ? new Date(
                                delivery.createdAt
                              ).toLocaleDateString()
                            : ""}
                        </small>

                      </div>

                      <span
                        className={`customer-status ${getStatusClass(
                          delivery.status
                        )}`}
                      >
                        {delivery.status ||
                          "Pending"}
                      </span>

                    </div>

                    {/* ROUTE */}

                    <div className="customer-route">

                      <div>

                        <small>
                          PICKUP
                        </small>

                        <p>
                          {delivery.exactPickupAddress ||
                            delivery.pickup ||
                            "No pickup address"}
                        </p>

                      </div>

                      <span>
                        ↓
                      </span>

                      <div>

                        <small>
                          DESTINATION
                        </small>

                        <p>
                          {delivery.exactAddress ||
                            delivery.destination ||
                            "No destination address"}
                        </p>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="customer-delivery-details">

                      <div>
                        <span>
                          Recipient
                        </span>

                        <strong>
                          {delivery.recipient ||
                            "Not provided"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Package
                        </span>

                        <strong>
                          {delivery.packageType ||
                            "Package"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Distance
                        </span>

                        <strong>
                          {delivery.distanceKm
                            ? `${delivery.distanceKm} km`
                            : "Not available"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Delivery Price
                        </span>

                        <strong>
                          ₦
                          {Number(
                            delivery.totalPrice ||
                              delivery.deliveryPrice ||
                              delivery.price ||
                              0
                          ).toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Payment
                        </span>

                        <strong
                          className={getPaymentClass(
                            delivery.paymentStatus
                          )}
                        >
                          {delivery.paymentStatus ||
                            "Unpaid"}
                        </strong>

                        {delivery.paymentMethod && (
                          <small className="customer-payment-method">
                            via{" "}
                            {delivery.paymentMethod ===
                            "transfer"
                              ? "Bank Transfer"
                              : "Cash"}
                          </small>
                        )}

                      </div>

                    </div>

                    {/* DRIVER */}

                    <div className="customer-driver">

                      <span>
                        Driver
                      </span>

                      <strong>
                        {delivery.assignedDriverName ||
                          "Waiting for driver assignment"}
                      </strong>

                    </div>

                    {/* DRIVER NOTE */}

                    {delivery.driverNote && (
                      <div className="customer-driver">
                        <span>
                          Driver Instructions
                        </span>

                        <strong>
                          {delivery.driverNote}
                        </strong>
                      </div>
                    )}

                    {/* ACTIONS */}

                    <div className="customer-card-actions">

                      <button
                        onClick={() =>
                          navigate(
                            `/track-delivery/${delivery.id}`
                          )
                        }
                      >
                        Track Delivery
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* HISTORY */}

        <section className="customer-section">

          <div className="customer-section-header">

            <div>

              <p className="customer-label">
                DELIVERY HISTORY
              </p>

              <h2>
                Completed Deliveries
              </h2>

            </div>

            <span>
              {completedDeliveries.length}
            </span>

          </div>

          {completedDeliveries.length === 0 ? (

            <div className="customer-empty small">

              <p>
                Completed deliveries will
                appear here.
              </p>

            </div>

          ) : (

            <div className="customer-history">

              {completedDeliveries.map(
                (delivery) => (

                  <div
                    className="customer-history-row"
                    key={delivery.id}
                  >

                    <div>

                      <strong>
                        {delivery.id}
                      </strong>

                      <span>
                        {delivery.pickup}
                        {" → "}
                        {delivery.destination}
                      </span>

                    </div>

                    <div className="history-payment">

                      <span
                        className={getPaymentClass(
                          delivery.paymentStatus
                        )}
                      >
                        {delivery.paymentStatus ||
                          "Unpaid"}
                      </span>

                      {delivery.paymentMethod && (
                        <small>
                          {delivery.paymentMethod}
                        </small>
                      )}

                    </div>

                    <div>

                      <span>
                        Delivered
                      </span>

                      <strong>
                        ₦
                        {Number(
                          delivery.totalPrice ||
                            delivery.deliveryPrice ||
                            delivery.price ||
                            0
                        ).toLocaleString()}
                      </strong>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </main>

      {/* FOOTER */}

      <footer className="customer-footer">

        <strong>
          Alejo Logistics
        </strong>

        <span>
          0707 752 4524
        </span>

        <span>
          Alejooafrica@gmail.com
        </span>

        <span>
          Lagos, Nigeria
        </span>

      </footer>

    </div>
  );
}

export default CustomerDashboard;
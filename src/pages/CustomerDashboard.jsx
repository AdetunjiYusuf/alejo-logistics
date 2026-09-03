import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCurrentUser,
  logoutUser,
} from "../utils/authStorage";

import {
  getDeliveries,
} from "../utils/deliveryStorage";

import Footer from "../components/Footer";

import "./CustomerDashboard.css";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [deliveries, setDeliveries] =
    useState([]);

  const loadData = () => {
    const currentUser =
      getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);

    const all =
      getDeliveries();

    const mine =
      all.filter(
        (delivery) =>
          delivery.customerId ===
            currentUser.id ||
          delivery.customerEmail ===
            currentUser.email
      );

    setDeliveries(mine);
  };

  useEffect(() => {
    loadData();

    const interval =
      setInterval(
        loadData,
        1500
      );

    return () =>
      clearInterval(interval);
  }, [navigate]);

  const logout = () => {
    logoutUser();
    navigate("/login");
  };

  const active =
    deliveries.filter(
      (item) =>
        item.status !==
          "Delivered" &&
        item.status !==
          "Rejected" &&
        item.status !==
          "Cancelled"
    );

  const completed =
    deliveries.filter(
      (item) =>
        item.status ===
        "Delivered"
    );

  const totalSpent =
    deliveries.reduce(
      (sum, item) =>
        sum +
        Number(
          item.totalPrice ||
            item.deliveryPrice ||
            0
        ),
      0
    );

  const money = (value) =>
    `₦${Number(
      value || 0
    ).toLocaleString()}`;

  const statusClass =
    (status) =>
      String(
        status || "Pending"
      )
        .toLowerCase()
        .replace(/\s+/g, "-");

  return (
    <div className="customer-page">

      <header className="customer-header">

        <div>
          <span className="dashboard-eyebrow">
            ALEJO LOGISTICS
          </span>

          <h1>
            Customer Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.fullName ||
                "Customer"}
            </strong>
          </p>
        </div>

        <div className="dashboard-actions">

          <button
            className="primary-button"
            onClick={() =>
              navigate(
                "/book-delivery"
              )
            }
          >
            + Book Delivery
          </button>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>
      </header>


      <main className="customer-main">

        <section className="stats-grid">

          <div className="stat-card">
            <span>Total Deliveries</span>
            <strong>
              {deliveries.length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Active</span>
            <strong>
              {active.length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Completed</span>
            <strong>
              {completed.length}
            </strong>
          </div>

          <div className="stat-card highlight">
            <span>Total Spent</span>
            <strong>
              {money(totalSpent)}
            </strong>
          </div>

        </section>


        <section
          className="delivery-section"
          id="my-deliveries"
        >

          <div className="section-heading">
            <div>
              <span>
                YOUR ORDERS
              </span>

              <h2>
                Active Deliveries
              </h2>
            </div>

            <button
              className="link-button"
              onClick={() =>
                navigate(
                  "/book-delivery"
                )
              }
            >
              New delivery →
            </button>
          </div>


          {active.length === 0 ? (

            <div className="empty-card">
              <div className="empty-icon">
                📦
              </div>

              <h3>
                No active deliveries
              </h3>

              <p>
                Book a delivery and
                you'll see its progress
                here.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  navigate(
                    "/book-delivery"
                  )
                }
              >
                Book Delivery
              </button>
            </div>

          ) : (

            <div className="delivery-grid">

              {active.map(
                (delivery) => (

                  <article
                    className="delivery-card"
                    key={delivery.id}
                  >

                    <div className="delivery-top">

                      <div>
                        <span>
                          {delivery.id}
                        </span>

                        <small>
                          {delivery.createdAt
                            ? new Date(
                                delivery.createdAt
                              ).toLocaleString()
                            : ""}
                        </small>
                      </div>

                      <b
                        className={`status-badge ${statusClass(
                          delivery.status
                        )}`}
                      >
                        {delivery.status ||
                          "Pending"}
                      </b>

                    </div>


                    <div className="route-box">

                      <div>
                        <small>
                          PICKUP AREA
                        </small>

                        <strong>
                          {delivery.pickup ||
                            "Not provided"}
                        </strong>

                        <p>
                          {delivery.exactPickupAddress ||
                            "Exact address not provided"}
                        </p>
                      </div>

                      <div className="route-arrow">
                        ↓
                      </div>

                      <div>
                        <small>
                          DESTINATION AREA
                        </small>

                        <strong>
                          {delivery.destination ||
                            "Not provided"}
                        </strong>

                        <p>
                          {delivery.exactDestinationAddress ||
                            "Exact address not provided"}
                        </p>
                      </div>

                    </div>


                    <div className="detail-grid">

                      <div>
                        <span>
                          Recipient
                        </span>

                        <strong>
                          {delivery.recipient ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Phone
                        </span>

                        <strong>
                          {delivery.phone ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Package
                        </span>

                        <strong>
                          {delivery.packageType ||
                            "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Distance
                        </span>

                        <strong>
                          {delivery.distanceKm ||
                            0} km
                        </strong>
                      </div>

                      <div>
                        <span>
                          Driver
                        </span>

                        <strong>
                          {delivery.assignedDriverName ||
                            "Not assigned"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Price
                        </span>

                        <strong>
                          {money(
                            delivery.totalPrice
                          )}
                        </strong>
                      </div>

                    </div>


                    {delivery.description && (
                      <div className="info-strip">
                        <span>
                          Package description
                        </span>

                        <p>
                          {delivery.description}
                        </p>
                      </div>
                    )}


                    {delivery.driverNote && (
                      <div className="info-strip">
                        <span>
                          Driver instructions
                        </span>

                        <p>
                          {delivery.driverNote}
                        </p>
                      </div>
                    )}


                    <div className="delivery-bottom">

                      <div>
                        <span>
                          Payment
                        </span>

                        <strong>
                          {delivery.paymentStatus ||
                            "Unpaid"}
                        </strong>

                        <small>
                          {delivery.paymentMethod ||
                            ""}
                        </small>
                      </div>

                      <button
                        className="track-button"
                        onClick={() =>
                          navigate(
                            `/track-delivery/${delivery.id}`
                          )
                        }
                      >
                        Track Delivery
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>


        <section className="delivery-section">

          <div className="section-heading">
            <div>
              <span>
                HISTORY
              </span>

              <h2>
                Completed Deliveries
              </h2>
            </div>
          </div>


          {completed.length === 0 ? (

            <div className="empty-small">
              No completed deliveries yet.
            </div>

          ) : (

            <div className="history-list">

              {completed.map(
                (delivery) => (

                  <div
                    className="history-row"
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

                    <div>
                      <span>
                        {delivery.paymentStatus}
                      </span>

                      <strong>
                        {money(
                          delivery.totalPrice
                        )}
                      </strong>
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default CustomerDashboard;
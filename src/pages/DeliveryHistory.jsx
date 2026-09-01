import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../utils/authStorage";
import { getDeliveries } from "../utils/deliveryStorage";

import "./DeliveryHistory.css";

function DeliveryHistory() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);

  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadHistory();
  }, [navigate]);

  const loadHistory = () => {
    const allDeliveries = getDeliveries();

    const customerDeliveries = allDeliveries.filter(
      (delivery) =>
        delivery.customerId === user?.id ||
        delivery.customerEmail === user?.email
    );

    setDeliveries(customerDeliveries);
  };

  const getStatusClass = (status) => {
    return (
      status
        ?.toLowerCase()
        .replace(/\s+/g, "-") || "pending"
    );
  };

  return (
    <div className="history-page">

      {/* SIDEBAR */}

      <aside className="history-sidebar">

        <div className="sidebar-brand">

          <div className="brand-icon">
            A
          </div>

          <div>
            <strong>ALEJO</strong>
            <span>LOGISTICS</span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            onClick={() =>
              navigate("/customer-dashboard")
            }
          >
            <span>▦</span>
            Overview
          </button>

          <button
            onClick={() =>
              navigate("/book-delivery")
            }
          >
            <span>▣</span>
            Book a delivery
          </button>

          <button
            onClick={() =>
              navigate("/track-deliveries")
            }
          >
            <span>⌖</span>
            Track deliveries
          </button>

          <button className="active">
            <span>▤</span>
            Delivery history
          </button>

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>♙</span>
            My profile
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>○</span>
            My profile
          </button>

          <button
            onClick={() => {
              localStorage.removeItem(
                "alejoCurrentUser"
              );

              navigate("/login");
            }}
          >
            <span>↪</span>
            Sign out
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="history-main">

        <div className="history-header">

          <p className="history-label">
            CUSTOMER PORTAL
          </p>

          <h1>
            Delivery history
          </h1>

          <p>
            View all your previous and current
            delivery bookings.
          </p>

        </div>


        {/* EMPTY */}

        {deliveries.length === 0 ? (

          <div className="history-empty">

            <div className="history-empty-icon">
              📦
            </div>

            <h2>
              No deliveries yet
            </h2>

            <p>
              Your delivery bookings will
              appear here.
            </p>

            <button
              onClick={() =>
                navigate("/book-delivery")
              }
            >
              Book a delivery
            </button>

          </div>

        ) : (

          <div className="history-list">

            {deliveries.map(
              (delivery) => (

                <div
                  className="history-card"
                  key={delivery.id}
                >

                  {/* TOP */}

                  <div className="history-card-top">

                    <div>

                      <span className="history-id">
                        {delivery.id}
                      </span>

                      <small>
                        {delivery.createdAt
                          ? new Date(
                              delivery.createdAt
                            ).toLocaleString()
                          : "Date unavailable"}
                      </small>

                    </div>

                    <span
                      className={`history-status ${getStatusClass(
                        delivery.status
                      )}`}
                    >
                      {delivery.status ||
                        "Pending"}
                    </span>

                  </div>


                  {/* ROUTE */}

                  <div className="history-route">

                    <div>

                      <span className="route-label">
                        PICKUP
                      </span>

                      <strong>
                        {delivery.pickup}
                      </strong>

                    </div>

                    <div className="route-arrow">
                      →
                    </div>

                    <div>

                      <span className="route-label">
                        DESTINATION
                      </span>

                      <strong>
                        {delivery.destination}
                      </strong>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="history-details">

                    <div>
                      <span>Recipient</span>
                      <strong>
                        {delivery.recipient ||
                          "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Package</span>
                      <strong>
                        {delivery.packageType ||
                          "Package"}
                      </strong>
                    </div>

                    <div>
                      <span>Distance</span>
                      <strong>
                        {delivery.distanceKm
                          ? `${delivery.distanceKm} km`
                          : "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Delivery price</span>
                      <strong>
                        ₦
                        {Number(
                          delivery.deliveryPrice ||
                            delivery.totalPrice ||
                            0
                        ).toLocaleString()}
                      </strong>
                    </div>

                  </div>


                  {/* PAYMENT */}

                  <div className="history-payment">

                    <span>
                      Payment
                    </span>

                    <strong>
                      {delivery.paymentStatus ||
                        "Unpaid"}
                    </strong>

                    {delivery.paymentMethod && (
                      <small>
                        {delivery.paymentMethod ===
                        "transfer"
                          ? "Bank Transfer"
                          : "Cash"}
                      </small>
                    )}

                  </div>


                  {/* DRIVER */}

                  {delivery.assignedDriverName && (

                    <div className="history-driver">

                      🚚 Driver:{" "}
                      <strong>
                        {
                          delivery.assignedDriverName
                        }
                      </strong>

                    </div>

                  )}


                  {/* ACTION */}

                  <button
                    className="history-track-button"
                    onClick={() =>
                      navigate(
                        `/track-delivery/${delivery.id}`
                      )
                    }
                  >
                    View delivery →
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default DeliveryHistory;
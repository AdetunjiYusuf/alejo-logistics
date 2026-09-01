import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDeliveries,
  acceptDelivery,
  releaseDelivery,
  saveDeliveries,
} from "../utils/deliveryStorage";

import "./DriverDashboard.css";

function DriverDashboard() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [message, setMessage] = useState("");

  const [isOnline, setIsOnline] = useState(
    () =>
      localStorage.getItem("alejoDriverOnline") === "true"
  );

  const driver = JSON.parse(
    localStorage.getItem("alejoCurrentDriver") || "null"
  );

  // ==========================================
  // PROTECT DRIVER PAGE
  // ==========================================

  useEffect(() => {
    const authenticated = localStorage.getItem(
      "alejoDriverAuthenticated"
    );

    if (authenticated !== "true" || !driver) {
      navigate("/driver-login");
      return;
    }

    loadDeliveries();
  }, [navigate]);

  // ==========================================
  // LOAD DELIVERIES
  // ==========================================

  const loadDeliveries = () => {
    setDeliveries(getDeliveries());
  };

  // ==========================================
  // ONLINE / OFFLINE
  // ==========================================

  const toggleOnlineStatus = () => {
    const newStatus = !isOnline;

    setIsOnline(newStatus);

    localStorage.setItem(
      "alejoDriverOnline",
      String(newStatus)
    );

    setMessage(
      newStatus
        ? "You are now Online and can receive delivery requests."
        : "You are now Offline and cannot accept new deliveries."
    );
  };

  // ==========================================
  // ACCEPT DELIVERY
  // ==========================================

  const handleAccept = (deliveryId) => {
    if (!driver) {
      setMessage("Driver account not found.");
      return;
    }

    if (!isOnline) {
      setMessage(
        "Please switch to Online before accepting a delivery."
      );
      return;
    }

    const result = acceptDelivery(deliveryId, driver);

    if (!result.success) {
      setMessage(result.message || "Unable to accept delivery.");
      loadDeliveries();
      return;
    }

    setMessage("Delivery accepted successfully.");

    setDeliveries(result.deliveries || getDeliveries());
  };

  // ==========================================
  // RELEASE DELIVERY
  // ==========================================

  const handleRelease = (deliveryId) => {
    if (!driver) {
      setMessage("Driver account not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to release this delivery?"
    );

    if (!confirmed) {
      return;
    }

    const updated = releaseDelivery(
      deliveryId,
      driver
    );

    setDeliveries(updated || getDeliveries());

    setMessage(
      "Delivery returned to available orders."
    );
  };

  // ==========================================
  // UPDATE DELIVERY STATUS
  // ==========================================

  const updateStatus = (deliveryId, status) => {
    if (!driver) {
      return;
    }

    const current = getDeliveries();

    const updated = current.map((delivery) => {
      if (delivery.id !== deliveryId) {
        return delivery;
      }

      if (
        delivery.assignedDriverId !== driver.id
      ) {
        return delivery;
      }

      return {
        ...delivery,
        status,
        orderStatus: status,
        updatedAt: new Date().toISOString(),
      };
    });

    saveDeliveries(updated);

    setDeliveries(updated);

    setMessage(
      `Delivery status updated to ${status}.`
    );
  };

  // ==========================================
  // GOOGLE MAPS ROUTE
  // ==========================================

  const openRoute = (delivery) => {
    const pickup =
      delivery.exactPickupAddress ||
      delivery.pickup ||
      "";

    const destination =
      delivery.exactAddress ||
      delivery.destination ||
      "";

    if (!pickup || !destination) {
      setMessage(
        "Pickup or destination address is missing."
      );
      return;
    }

    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(pickup)}` +
      `&destination=${encodeURIComponent(destination)}`;

    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================
  // AVAILABLE ORDERS
  // ==========================================

  const availableOrders = deliveries.filter(
    (delivery) =>
      delivery.status === "Approved" &&
      !delivery.assignedDriverId &&
      !delivery.acceptedByDriver
  );

  // ==========================================
  // MY ORDERS
  // ==========================================

  const myOrders = deliveries.filter(
    (delivery) =>
      delivery.assignedDriverId === driver?.id
  );

  // ==========================================
  // DELIVERED
  // ==========================================

  const deliveredOrders = myOrders.filter(
    (delivery) =>
      delivery.status === "Delivered"
  );

  // ==========================================
  // IN TRANSIT
  // ==========================================

  const inTransitOrders = myOrders.filter(
    (delivery) =>
      delivery.status === "In Transit"
  );

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "alejoDriverAuthenticated"
    );

    localStorage.removeItem(
      "alejoCurrentDriver"
    );

    localStorage.removeItem(
      "alejoDriverOnline"
    );

    navigate("/driver-login");
  };

  return (
    <div className="driver-page">

      {/* HEADER */}

      <header className="driver-header">

        <div>
          <p className="driver-label">
            ALEJO LOGISTICS
          </p>

          <h1>
            Driver Dashboard
          </h1>

          <p>
            Welcome{" "}
            <strong>
              {driver?.name || "Driver"}
            </strong>
          </p>
        </div>

        <div className="driver-header-actions">

          <button
            className={
              isOnline
                ? "driver-online active"
                : "driver-online"
            }
            onClick={toggleOnlineStatus}
          >
            <span className="online-dot">
              ●
            </span>

            {isOnline
              ? "Online"
              : "Offline"}
          </button>

          <button
            className="driver-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* MESSAGE */}

      {message && (
        <div className="driver-message">

          <span>
            {message}
          </span>

          <button
            onClick={() => setMessage("")}
          >
            ×
          </button>

        </div>
      )}

      {/* STATS */}

      <div className="driver-stats">

        <div>
          <span>
            Available Orders
          </span>

          <strong>
            {availableOrders.length}
          </strong>
        </div>

        <div>
          <span>
            My Orders
          </span>

          <strong>
            {myOrders.length}
          </strong>
        </div>

        <div>
          <span>
            In Transit
          </span>

          <strong>
            {inTransitOrders.length}
          </strong>
        </div>

        <div>
          <span>
            Delivered
          </span>

          <strong>
            {deliveredOrders.length}
          </strong>
        </div>

      </div>

      {/* AVAILABLE ORDERS */}

      <section className="driver-section">

        <div className="driver-section-header">

          <div>
            <p className="driver-label">
              DISPATCH BOARD
            </p>

            <h2>
              Available Orders
            </h2>
          </div>

          <span>
            {availableOrders.length} available
          </span>

        </div>

        {availableOrders.length === 0 ? (

          <div className="driver-empty">

            <div>
              📦
            </div>

            <h3>
              No available orders
            </h3>

            <p>
              Approved customer bookings
              will appear here.
            </p>

          </div>

        ) : (

          <div className="driver-orders">

            {availableOrders.map(
              (delivery) => (

                <div
                  className="driver-order"
                  key={delivery.id}
                >

                  <div className="order-top">

                    <strong>
                      {delivery.id}
                    </strong>

                    <span className="status approved">
                      Approved
                    </span>

                  </div>

                  <div className="driver-customer">

                    <strong>
                      👤{" "}
                      {delivery.customerName ||
                        "Customer"}
                    </strong>

                    <span>
                      📞{" "}
                      {delivery.customerPhone ||
                        delivery.phone ||
                        "No phone"}
                    </span>

                  </div>

                  <div className="order-route">

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

                  <div className="order-details">

                    <span>
                      Recipient:
                      <strong>
                        {" "}
                        {delivery.recipient ||
                          "Not provided"}
                      </strong>
                    </span>

                    <span>
                      Package:
                      <strong>
                        {" "}
                        {delivery.packageType ||
                          "Package"}
                      </strong>
                    </span>

                    {delivery.distanceKm && (
                      <span>
                        Distance:
                        <strong>
                          {" "}
                          {delivery.distanceKm} km
                        </strong>
                      </span>
                    )}

                  </div>

                  <button
                    className="accept-order"
                    disabled={!isOnline}
                    onClick={() =>
                      handleAccept(
                        delivery.id
                      )
                    }
                  >
                    {isOnline
                      ? "Accept Delivery"
                      : "Go Online to Accept"}
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* MY DELIVERIES */}

      <section className="driver-section">

        <div className="driver-section-header">

          <div>

            <p className="driver-label">
              MY WORK
            </p>

            <h2>
              My Assigned Deliveries
            </h2>

          </div>

          <span>
            {myOrders.length} assigned
          </span>

        </div>

        {myOrders.length === 0 ? (

          <div className="driver-empty">

            <div>
              🚚
            </div>

            <h3>
              No assigned deliveries
            </h3>

            <p>
              Accepted deliveries will
              appear here.
            </p>

          </div>

        ) : (

          <div className="driver-orders">

            {myOrders.map(
              (delivery) => {

                const statusClass =
                  delivery.status
                    ?.toLowerCase()
                    .replace(/\s+/g, "-") ||
                  "pending";

                return (
                  <div
                    className="driver-order accepted"
                    key={delivery.id}
                  >

                    <div className="order-top">

                      <strong>
                        {delivery.id}
                      </strong>

                      <span
                        className={`status ${statusClass}`}
                      >
                        {delivery.status}
                      </span>

                    </div>

                    <div className="driver-customer">

                      <strong>
                        👤{" "}
                        {delivery.customerName ||
                          "Customer"}
                      </strong>

                      <span>
                        📞{" "}
                        {delivery.customerPhone ||
                          delivery.phone ||
                          "No phone"}
                      </span>

                    </div>

                    <div className="order-route">

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

                    <div className="order-details">

                      <span>
                        Recipient:
                        <strong>
                          {" "}
                          {delivery.recipient ||
                            "Not provided"}
                        </strong>
                      </span>

                      <span>
                        Package:
                        <strong>
                          {" "}
                          {delivery.packageType ||
                            "Package"}
                        </strong>
                      </span>

                      {delivery.distanceKm && (
                        <span>
                          Distance:
                          <strong>
                            {" "}
                            {delivery.distanceKm} km
                          </strong>
                        </span>
                      )}

                    </div>

                    <div className="driver-actions">

                      <button
                        className="maps-button"
                        onClick={() =>
                          openRoute(
                            delivery
                          )
                        }
                      >
                        📍 Open Route
                      </button>

                      {delivery.status !==
                        "Delivered" && (

                        <select
                          value={
                            delivery.status ||
                            "Accepted"
                          }
                          onChange={(e) =>
                            updateStatus(
                              delivery.id,
                              e.target.value
                            )
                          }
                        >

                          <option value="Accepted">
                            Accepted
                          </option>

                          <option value="Picked Up">
                            Picked Up
                          </option>

                          <option value="In Transit">
                            In Transit
                          </option>

                          <option value="Delivered">
                            Delivered
                          </option>

                        </select>

                      )}

                      {delivery.status !==
                        "Delivered" && (

                        <button
                          className="release-order"
                          onClick={() =>
                            handleRelease(
                              delivery.id
                            )
                          }
                        >
                          Release
                        </button>

                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* CONTACT */}

      <footer className="driver-footer">
        <strong>
          Alejo Logistics
        </strong>

        <span>
          0707 752 4524
        </span>

        <span>
          Alejooafrica@gmail.com
        </span>
      </footer>

    </div>
  );
}

export default DriverDashboard;
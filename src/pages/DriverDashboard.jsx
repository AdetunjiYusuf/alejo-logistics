import { useEffect, useMemo, useState } from "react";
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
  const [online, setOnline] = useState(false);
  const [driver, setDriver] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const authenticated =
      localStorage.getItem("alejoDriverAuthenticated") === "true";

    const savedDriver = localStorage.getItem("alejoCurrentDriver");

    if (!authenticated || !savedDriver) {
      navigate("/driver-login");
      return;
    }

    try {
      const parsedDriver = JSON.parse(savedDriver);
      setDriver(parsedDriver);
    } catch {
      localStorage.removeItem("alejoCurrentDriver");
      navigate("/driver-login");
      return;
    }

    setOnline(
      localStorage.getItem("alejoDriverOnline") === "true"
    );

    loadDeliveries();
  }, [navigate]);

  const loadDeliveries = () => {
    setDeliveries(getDeliveries());
  };

  const availableDeliveries = useMemo(() => {
    return deliveries.filter(
      (delivery) =>
        delivery.status === "Approved" &&
        !delivery.assignedDriverId &&
        !delivery.acceptedByDriver
    );
  }, [deliveries]);

  const myDeliveries = useMemo(() => {
    if (!driver) return [];

    return deliveries.filter(
      (delivery) =>
        String(delivery.assignedDriverId) === String(driver.id)
    );
  }, [deliveries, driver]);

  const completedDeliveries = useMemo(() => {
    if (!driver) return [];

    return deliveries.filter(
      (delivery) =>
        String(delivery.assignedDriverId) === String(driver.id) &&
        delivery.status === "Delivered"
    );
  }, [deliveries, driver]);

  const toggleOnline = () => {
    const newStatus = !online;

    setOnline(newStatus);
    localStorage.setItem(
      "alejoDriverOnline",
      String(newStatus)
    );

    setMessage(
      newStatus
        ? "You are now online and can accept deliveries."
        : "You are now offline."
    );

    setTimeout(() => setMessage(""), 3000);
  };

  const handleAccept = (deliveryId) => {
    if (!online) {
      setMessage("Please go online before accepting a delivery.");
      return;
    }

    if (!driver) return;

    const result = acceptDelivery(deliveryId, driver);

    if (result?.success) {
      setDeliveries(result.deliveries || getDeliveries());
      setMessage("Delivery accepted successfully.");
    } else {
      setMessage(
        result?.message || "Unable to accept this delivery."
      );
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const handleRelease = (deliveryId) => {
    if (!driver) return;

    const confirmed = window.confirm(
      "Are you sure you want to release this delivery?"
    );

    if (!confirmed) return;

    const result = releaseDelivery(deliveryId, driver);

    if (result?.success) {
      setDeliveries(result.deliveries || getDeliveries());
      setMessage("Delivery released.");
    } else {
      setMessage(
        result?.message || "Unable to release delivery."
      );
    }

    setTimeout(() => setMessage(""), 3000);
  };

  const updateStatus = (deliveryId, newStatus) => {
    if (!driver) return;

    const updated = deliveries.map((delivery) => {
      if (
        String(delivery.id) === String(deliveryId) &&
        String(delivery.assignedDriverId) === String(driver.id)
      ) {
        return {
          ...delivery,
          status: newStatus,
          orderStatus: newStatus,
          updatedAt: new Date().toISOString(),
          ...(newStatus === "Delivered"
            ? { deliveredAt: new Date().toISOString() }
            : {}),
        };
      }

      return delivery;
    });

    saveDeliveries(updated);
    setDeliveries(updated);

    setMessage(`Delivery status changed to ${newStatus}.`);

    setTimeout(() => setMessage(""), 3000);
  };

  const openRoute = (delivery) => {
    const pickup =
      delivery.exactPickupAddress ||
      delivery.pickup ||
      "";

    const destination =
      delivery.exactAddress ||
      delivery.exactDestinationAddress ||
      delivery.destination ||
      "";

    if (!pickup || !destination) {
      setMessage("Pickup or destination address is missing.");
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(pickup)}` +
      `&destination=${encodeURIComponent(destination)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const logout = () => {
    localStorage.removeItem("alejoDriverAuthenticated");
    localStorage.removeItem("alejoCurrentDriver");
    localStorage.removeItem("alejoDriverOnline");

    navigate("/driver-login");
  };

  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  const formatPrice = (delivery) => {
    const price =
      delivery.totalPrice ??
      delivery.deliveryPrice ??
      delivery.price ??
      0;

    return `₦${Number(price).toLocaleString()}`;
  };

  const formatDistance = (delivery) => {
    if (
      delivery.distanceKm === undefined ||
      delivery.distanceKm === null ||
      delivery.distanceKm === ""
    ) {
      return "Distance unavailable";
    }

    return `${Number(delivery.distanceKm).toFixed(1)} km`;
  };

  if (!driver) {
    return null;
  }

  return (
    <div className="driver-page">

      {/* HEADER */}
      <header className="driver-header">
        <div className="driver-brand">
          <div className="driver-logo">
            A
          </div>

          <div>
            <h1>ALEJO LOGISTICS</h1>
            <span>Driver Dashboard</span>
          </div>
        </div>

        <div className="driver-header-right">
          <div
            className={`driver-online-status ${
              online ? "is-online" : "is-offline"
            }`}
            onClick={toggleOnline}
          >
            <span className="status-dot"></span>

            {online ? "Online" : "Offline"}
          </div>

          <button
            className="driver-logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="driver-main">

        {/* HERO */}
        <section className="driver-hero">
          <div>
            <p className="hero-label">DRIVER DASHBOARD</p>

            <h2>
              Here's what's happening with your deliveries today.
            </h2>
          </div>

          <button
            className={`hero-online-btn ${
              online ? "active" : ""
            }`}
            onClick={toggleOnline}
          >
            <span className="status-dot"></span>

            {online
              ? "You are Online"
              : "Go Online"}
          </button>
        </section>

        {/* MESSAGE */}
        {message && (
          <div className="driver-message">
            <span>✓</span>
            {message}
          </div>
        )}

        {/* STATS */}
        <section className="driver-stats">

          <div className="driver-stat-card">
            {/* <div className="stat-icon orange">
              📦
            </div> */}

            <div className="stat-number">
              {availableDeliveries.length}
            </div>

            <div className="stat-title">
              Available Deliveries
            </div>

            <div className="stat-description">
              Ready for you
            </div>
          </div>

          <div className="driver-stat-card">
            {/* <div className="stat-icon blue">
              🚚
            </div> */}

            <div className="stat-number">
              {myDeliveries.length}
            </div>

            <div className="stat-title">
              My Deliveries
            </div>

            <div className="stat-description">
              Currently assigned
            </div>
          </div>

          <div className="driver-stat-card">
            {/* <div className="stat-icon green">
              ✓
            </div> */}

            <div className="stat-number">
              {completedDeliveries.length}
            </div>

            <div className="stat-title">
              Completed
            </div>

            <div className="stat-description">
              Delivered successfully
            </div>
          </div>

        </section>

        {/* AVAILABLE */}
        <section className="driver-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                AVAILABLE WORK
              </p>

              <h3>
                Available Deliveries
              </h3>
            </div>

            <span className="section-count">
              {availableDeliveries.length}
            </span>
          </div>

          {availableDeliveries.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">
                📦
              </div>

              <h4>No deliveries available</h4>

              <p>
                New approved deliveries will appear
                here when they are ready.
              </p>
            </div>
          ) : (
            <div className="delivery-grid">

              {availableDeliveries.map((delivery) => (
                <div
                  className="delivery-card"
                  key={delivery.id}
                >

                  <div className="delivery-card-top">
                    <div>
                      <span className="delivery-id">
                        {delivery.id}
                      </span>

                      <span className="delivery-status approved">
                        Approved
                      </span>
                    </div>

                    <strong className="delivery-price">
                      {formatPrice(delivery)}
                    </strong>
                  </div>

                  <div className="route-box">

                    <div className="route-row">
                      <span className="route-dot pickup"></span>

                      <div>
                        <small>Pickup</small>

                        <strong>
                          {delivery.exactPickupAddress ||
                            delivery.pickup ||
                            "Not provided"}
                        </strong>
                      </div>
                    </div>

                    <div className="route-line"></div>

                    <div className="route-row">
                      <span className="route-dot destination"></span>

                      <div>
                        <small>Destination</small>

                        <strong>
                          {delivery.exactAddress ||
                            delivery.exactDestinationAddress ||
                            delivery.destination ||
                            "Not provided"}
                        </strong>
                      </div>
                    </div>

                  </div>

                  <div className="delivery-info">

                    <div>
                      <small>Package</small>
                      <strong>
                        {delivery.packageType ||
                          "Package"}
                      </strong>
                    </div>

                    <div>
                      <small>Distance</small>
                      <strong>
                        {formatDistance(delivery)}
                      </strong>
                    </div>

                  </div>

                  {delivery.driverNote && (
                    <div className="driver-note">
                      <strong>Driver Instructions</strong>

                      <p>
                        {delivery.driverNote}
                      </p>
                    </div>
                  )}

                  <div className="delivery-actions">
                    <button
                      className="route-btn"
                      onClick={() =>
                        openRoute(delivery)
                      }
                    >
                      🗺 View Route
                    </button>

                    <button
                      className="accept-btn"
                      onClick={() =>
                        handleAccept(delivery.id)
                      }
                    >
                      Accept Delivery
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* MY DELIVERIES */}
        <section className="driver-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                ACTIVE ORDERS
              </p>

              <h3>
                My Deliveries
              </h3>
            </div>

            <span className="section-count">
              {myDeliveries.length}
            </span>
          </div>

          {myDeliveries.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">
                🚚
              </div>

              <h4>No assigned deliveries</h4>

              <p>
                Accept an available delivery to see
                it here.
              </p>
            </div>
          ) : (
            <div className="delivery-grid">

              {myDeliveries.map((delivery) => (
                <div
                  className="delivery-card"
                  key={delivery.id}
                >

                  <div className="delivery-card-top">

                    <div>
                      <span className="delivery-id">
                        {delivery.id}
                      </span>

                      <span
                        className={`delivery-status ${getStatusClass(
                          delivery.status
                        )}`}
                      >
                        {delivery.status ||
                          "Assigned"}
                      </span>
                    </div>

                    <strong className="delivery-price">
                      {formatPrice(delivery)}
                    </strong>

                  </div>

                  <div className="route-box">

                    <div className="route-row">
                      <span className="route-dot pickup"></span>

                      <div>
                        <small>Pickup</small>

                        <strong>
                          {delivery.exactPickupAddress ||
                            delivery.pickup ||
                            "Not provided"}
                        </strong>
                      </div>
                    </div>

                    <div className="route-line"></div>

                    <div className="route-row">
                      <span className="route-dot destination"></span>

                      <div>
                        <small>Destination</small>

                        <strong>
                          {delivery.exactAddress ||
                            delivery.exactDestinationAddress ||
                            delivery.destination ||
                            "Not provided"}
                        </strong>
                      </div>
                    </div>

                  </div>

                  <div className="delivery-info">

                    <div>
                      <small>Recipient</small>

                      <strong>
                        {delivery.recipient ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <small>Phone</small>

                      <strong>
                        {delivery.recipientPhone ||
                          delivery.phone ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <small>Package</small>

                      <strong>
                        {delivery.packageType ||
                          "Package"}
                      </strong>
                    </div>

                    <div>
                      <small>Distance</small>

                      <strong>
                        {formatDistance(delivery)}
                      </strong>
                    </div>

                  </div>

                  {delivery.driverNote && (
                    <div className="driver-note">
                      <strong>
                        Driver Instructions
                      </strong>

                      <p>
                        {delivery.driverNote}
                      </p>
                    </div>
                  )}

                  <div className="delivery-actions">

                    <button
                      className="route-btn"
                      onClick={() =>
                        openRoute(delivery)
                      }
                    >
                      🗺 View Route
                    </button>

                    {delivery.status !==
                      "Delivered" && (
                      <button
                        className="release-btn"
                        onClick={() =>
                          handleRelease(delivery.id)
                        }
                      >
                        Release
                      </button>
                    )}

                  </div>

                  {delivery.status !==
                    "Delivered" && (
                    <div className="status-control">

                      <label>
                        Update Delivery Status
                      </label>

                      <select
                        value={
                          delivery.status || "Accepted"
                        }
                        onChange={(event) =>
                          updateStatus(
                            delivery.id,
                            event.target.value
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

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

        {/* COMPLETED */}
        <section className="driver-section">

          <div className="section-heading">
            <div>
              <p className="section-label">
                DELIVERY HISTORY
              </p>

              <h3>
                Completed Deliveries
              </h3>
            </div>

            <span className="section-count">
              {completedDeliveries.length}
            </span>
          </div>

          {completedDeliveries.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">
                ✓
              </div>

              <h4>No completed deliveries</h4>

              <p>
                Completed deliveries will appear
                here.
              </p>
            </div>
          ) : (
            <div className="completed-list">

              {completedDeliveries.map((delivery) => (
                <div
                  className="completed-card"
                  key={delivery.id}
                >

                  <div className="completed-check">
                    ✓
                  </div>

                  <div className="completed-main">

                    <div className="completed-title-row">

                      <strong>
                        {delivery.id}
                      </strong>

                      <span className="completed-status">
                        Delivered
                      </span>

                    </div>

                    <p>
                      {delivery.pickup ||
                        delivery.exactPickupAddress ||
                        "Pickup"}{" "}
                      →{" "}
                      {delivery.destination ||
                        delivery.exactAddress ||
                        "Destination"}
                    </p>

                    <div className="completed-meta">

                      <span>
                        Package: {delivery.packageType || "Package"}
                      </span>

                      <span>
                        {formatDistance(delivery)}
                      </span>

                      <span>
                        {formatPrice(delivery)}
                      </span>

                    </div>

                  </div>

                  <div className="completed-date">
                    {delivery.deliveredAt
                      ? new Date(
                          delivery.deliveredAt
                        ).toLocaleDateString()
                      : delivery.updatedAt
                      ? new Date(
                          delivery.updatedAt
                        ).toLocaleDateString()
                      : "Completed"}
                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer className="alejo-footer">

        <div className="footer-inner">

          <div className="footer-brand">

            <div className="footer-logo">
              A
            </div>

            <div>
              <strong>
                ALEJO LOGISTICS
              </strong>

              <p>
                Reliable delivery. Simple tracking. Better service.
              </p>
            </div>

          </div>

          <div className="footer-contact">

            <a href="tel:07077524524">
              0707 752 4524
            </a>

            <a href="mailto:alejoafrica@gmail.com">
              alejoafrica@gmail.com
            </a>

          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Alejo Logistics
          </span>

          <span>
            All rights reserved.
          </span>
        </div>

      </footer>

    </div>
  );
}

export default DriverDashboard;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "../utils/authStorage";
import { createDelivery } from "../utils/deliveryStorage";

import {
  calculateDeliveryPrice,
  getPricing,
} from "../utils/pricingStorage";

import "./BookDelivery.css";

function BookDelivery() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    exactPickupAddress: "", // NEW FIELD
    exactAddress: "",
    driverNote: "",
    recipient: "",
    phone: "",
    packageType: "",
    senderName: "",
    transferAmount: "",
  });

  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("transfer");

  const [calculating, setCalculating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "pickup" || name === "destination") {
      setDistance(null);
      setPrice(null);
    }
  };

  const geocodeLocation = async (location) => {
    const url =
      "https://nominatim.openstreetmap.org/search" +
      "?format=json" +
      "&limit=1" +
      "&countrycodes=ng" +
      "&q=" +
      encodeURIComponent(location);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        "The location service is temporarily unavailable."
      );
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Location not found: ${location}`);
    }

    return {
      lat: Number(data[0].lat),
      lon: Number(data[0].lon),
    };
  };

  const getRoadDistance = async (pickup, destination) => {
    const pickupCoords = await geocodeLocation(pickup);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const destinationCoords =
      await geocodeLocation(destination);

    const routeUrl =
      "https://router.project-osrm.org/route/v1/driving/" +
      `${pickupCoords.lon},${pickupCoords.lat};` +
      `${destinationCoords.lon},${destinationCoords.lat}` +
      "?overview=false";

    const routeResponse = await fetch(routeUrl);

    if (!routeResponse.ok) {
      throw new Error(
        "Could not calculate the road route."
      );
    }

    const routeData = await routeResponse.json();

    if (
      !routeData.routes ||
      routeData.routes.length === 0
    ) {
      throw new Error(
        "No driving route was found between these locations."
      );
    }

    return Number(
      (routeData.routes[0].distance / 1000).toFixed(1)
    );
  };

  const calculatePrice = async () => {
    if (
      !form.pickup.trim() ||
      !form.destination.trim()
    ) {
      setError(
        "Enter both the pickup area and destination area."
      );
      return;
    }

    setError("");
    setCalculating(true);

    try {
      const calculatedDistance =
        await getRoadDistance(
          form.pickup.trim(),
          form.destination.trim()
        );

      const pricing = getPricing();

      const calculatedPrice =
        calculateDeliveryPrice(
          calculatedDistance,
          pricing
        );

      setDistance(calculatedDistance);
      setPrice(calculatedPrice);
    } catch (err) {
      console.error(
        "Distance calculation error:",
        err
      );

      setError(
        err.message ||
          "Unable to calculate the route."
      );

      setDistance(null);
      setPrice(null);
    } finally {
      setCalculating(false);
    }
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);

    setForm((previous) => ({
      ...previous,
      senderName:
        method === "transfer"
          ? previous.senderName
          : "",
      transferAmount:
        method === "transfer"
          ? previous.transferAmount
          : "",
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (booking) return;

    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (
      !form.pickup.trim() ||
      !form.destination.trim() ||
      !form.exactPickupAddress.trim() || // NEW VALIDATION
      !form.exactAddress.trim() ||
      !form.driverNote.trim() ||
      !form.recipient.trim() ||
      !form.phone.trim() ||
      !form.packageType
    ) {
      setError(
        "Please complete all required delivery details."
      );
      return;
    }

    if (
      distance === null ||
      price === null
    ) {
      setError(
        "Please calculate the delivery price first."
      );
      return;
    }

    if (paymentMethod === "transfer") {
      if (!form.senderName.trim()) {
        setError(
          "Enter the name that will appear on the bank transfer."
        );
        return;
      }

      if (!form.transferAmount) {
        setError(
          "Enter the amount you are transferring."
        );
        return;
      }

      const amountSent =
        Number(form.transferAmount);

      if (
        Number.isNaN(amountSent) ||
        amountSent <= 0
      ) {
        setError(
          "Enter a valid transfer amount."
        );
        return;
      }

      if (amountSent < Number(price)) {
        setError(
          `The transfer amount cannot be less than ₦${Number(
            price
          ).toLocaleString()}.`
        );
        return;
      }
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setBooking(true);

    try {
      const pricing = getPricing();

      const deliveryId = `ALJ-${Date.now()}`;

      const isTransfer =
        paymentMethod === "transfer";

      createDelivery({
        id: deliveryId,

        customerId: currentUser.id,

        customerName:
          currentUser.fullName || "",

        customerEmail:
          currentUser.email || "",

        customerPhone:
          currentUser.phone || "",

        pickup:
          form.pickup.trim(),

        destination:
          form.destination.trim(),

        exactPickupAddress: // NEW FIELD
          form.exactPickupAddress.trim(),

        exactAddress:
          form.exactAddress.trim(),

        driverNote:
          form.driverNote.trim(),

        description:
          form.driverNote.trim(),

        recipient:
          form.recipient.trim(),

        phone:
          form.phone.trim(),

        packageType:
          form.packageType,

        distanceKm:
          distance,

        baseFee:
          pricing.baseFee,

        pricePerKm:
          pricing.pricePerKm,

        deliveryPrice:
          price,

        totalPrice:
          price,

        paymentMethod:
          paymentMethod,

        paymentStatus:
          isTransfer
            ? "Awaiting Payment"
            : "Pay on Delivery",

        paymentReference:
          null,

        transferSenderName:
          isTransfer
            ? form.senderName.trim()
            : null,

        transferAmount:
          isTransfer
            ? Number(form.transferAmount)
            : null,

        status:
          isTransfer
            ? "Awaiting Payment"
            : "Pending",

        orderStatus:
          isTransfer
            ? "Awaiting Payment"
            : "Pending",

        assignedDriverId:
          null,

        assignedDriverName:
          null,

        acceptedByDriver:
          false,

        driverFee:
          0,

        driverEarningsStatus:
          "Pending",

        paymentConfirmed:
          false,

        paymentConfirmedAt:
          null,

        paymentConfirmedBy:
          null,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      });

      navigate("/customer-dashboard");
    } catch (err) {
      console.error(
        "Delivery creation failed:",
        err
      );

      setError(
        "Could not create the delivery. Please try again."
      );

      setBooking(false);
    }
  };

  return (
    <div className="booking-page">

      <aside className="booking-sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">A</div>

          <div className="brand-text">
            <strong>ALEJO</strong>
            <span>LOGISTICS</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <button
            type="button"
            onClick={() =>
              navigate("/customer-dashboard")
            }
          >
            <span>▦</span>
            <b>Overview</b>
          </button>

          <button
            type="button"
            className="active"
          >
            <span>▣</span>
            <b>Book a delivery</b>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/track-delivery")
            }
          >
            <span>⌖</span>
            <b>Track deliveries</b>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/delivery-history")
            }
          >
            <span>▤</span>
            <b>Delivery history</b>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>♙</span>
            <b>My profile</b>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>○</span>
            <b>My profile</b>
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "alejoCurrentUser"
              );

              navigate("/login");
            }}
          >
            <span>↪</span>
            <b>Sign out</b>
          </button>

        </div>

      </aside>

      <main className="booking-main">

        <header className="booking-header">

          <div>
            <p className="booking-label">
              CUSTOMER PORTAL
            </p>

            <h1>
              Book a delivery
            </h1>

            <p className="booking-subtitle">
              Enter your route, package details and payment method.
            </p>
          </div>

        </header>

        <div className="steps-container">

          <div className="step-item active">
            <div className="step-number">
              1
            </div>

            <div className="step-content">
              <strong>
                Route details
              </strong>

              <span>
                Enter delivery information
              </span>
            </div>
          </div>

          <div className="step-connector" />

          <div className="step-item">
            <div className="step-number">
              2
            </div>

            <div className="step-content">
              <strong>
                Review & payment
              </strong>

              <span>
                Confirm your booking
              </span>
            </div>
          </div>

          <div className="step-connector" />

          <div className="step-item">
            <div className="step-number">
              3
            </div>

            <div className="step-content">
              <strong>
                Confirmed
              </strong>

              <span>
                Track your delivery
              </span>
            </div>
          </div>

        </div>

        <div className="booking-content">

          <form
            className="booking-card"
            onSubmit={handleSubmit}
          >

            <div className="card-section">

              <div className="card-section-header">

                <span className="section-badge">
                  01
                </span>

                <div>
                  <h2>
                    Where are we going?
                  </h2>

                  <p>
                    Enter the pickup and destination information.
                  </p>
                </div>

              </div>

              <div className="form-group">

                <label>
                  Pickup area{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  name="pickup"
                  type="text"
                  value={form.pickup}
                  onChange={handleChange}
                  placeholder="e.g. Challenge, Ibadan"
                />

                <small>
                  Enter the main area, estate or landmark.
                </small>

              </div>

              {/* NEW FIELD - Exact Pickup Address */}
              <div className="form-group">

                <label>
                  Exact pickup address{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  name="exactPickupAddress"
                  type="text"
                  value={form.exactPickupAddress}
                  onChange={handleChange}
                  placeholder="Enter your exact pickup address"
                />

                <small>
                  This is the exact address the driver should pick up from.
                </small>

              </div>

              <div className="form-group">

                <label>
                  Destination area{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  name="destination"
                  type="text"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="e.g. Ring Road, Ibadan"
                />

              </div>

              <div className="form-group">

                <label>
                  Exact delivery address{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  name="exactAddress"
                  type="text"
                  value={form.exactAddress}
                  onChange={handleChange}
                  placeholder="Enter your exact address"
                />

                <small>
                  This is the exact address the driver should deliver to.
                </small>

              </div>

              <div className="form-group">

                <label>
                  What should we tell the driver?{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <textarea
                  name="driverNote"
                  value={form.driverNote}
                  onChange={handleChange}
                  placeholder="Tell the driver anything important about finding or delivering the package..."
                  rows="4"
                />

              </div>

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Recipient name{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    name="recipient"
                    type="text"
                    value={form.recipient}
                    onChange={handleChange}
                    placeholder="Recipient's name"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Recipient phone{" "}
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="080..."
                  />

                </div>

              </div>

              <div className="form-group">

                <label>
                  Package type{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <select
                  name="packageType"
                  value={form.packageType}
                  onChange={handleChange}
                >

                  <option value="">
                    Select package
                  </option>

                  <option value="Document">
                    Document
                  </option>

                  <option value="Food">
                    Food
                  </option>

                  <option value="Clothing">
                    Clothing
                  </option>

                  <option value="Electronics">
                    Electronics
                  </option>

                  <option value="Parcel">
                    Parcel
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

            </div>

            <div className="card-section">

              <div className="card-section-header">

                <span className="section-badge">
                  02
                </span>

                <div>
                  <h2>
                    Payment method
                  </h2>

                  <p>
                    Choose how you want to pay.
                  </p>
                </div>

              </div>

              <div className="payment-options">

                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === "transfer"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handlePaymentChange(
                      "transfer"
                    )
                  }
                >

                  <div className="payment-icon">
                    ⇄
                  </div>

                  <div className="payment-text">
                    <strong>
                      Bank Transfer
                    </strong>

                    <span>
                      Payment must be confirmed before dispatch.
                    </span>
                  </div>

                  <div className="payment-check">
                    {paymentMethod ===
                      "transfer" && "✓"}
                  </div>

                </button>

                <button
                  type="button"
                  className={`payment-option ${
                    paymentMethod === "cash"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handlePaymentChange(
                      "cash"
                    )
                  }
                >

                  <div className="payment-icon cash">
                    ₦
                  </div>

                  <div className="payment-text">
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay the driver when the package arrives.
                    </span>
                  </div>

                  <div className="payment-check">
                    {paymentMethod ===
                      "cash" && "✓"}
                  </div>

                </button>

              </div>

              {paymentMethod === "transfer" && (

                <div className="transfer-details">

                  <div className="transfer-header">

                    <div>
                      <strong>
                        Bank transfer details
                      </strong>

                      <p>
                        Transfer the delivery amount and enter the sender details.
                      </p>
                    </div>

                    <span className="secure-badge">
                      SECURE PAYMENT
                    </span>

                  </div>

                  <div className="bank-details-grid">

                    <div>
                      <small>
                        BANK
                      </small>

                      <strong>
                       Providus Bank
                      </strong>
                    </div>

                    <div>
                      <small>
                        ACCOUNT NUMBER
                      </small>

                      <strong className="account-number">
                       9653727050
                      </strong>
                    </div>

                    <div>
                      <small>
                        ACCOUNT NAME
                      </small>

                      <strong>
                      Alejo Logistics
                      </strong>
                    </div>

                  </div>

                  <div className="transfer-form-row">

                    <div className="form-group">

                      <label>
                        Name on transfer{" "}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <input
                        name="senderName"
                        type="text"
                        value={form.senderName}
                        onChange={handleChange}
                        placeholder="Name the admin will see"
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Amount sent{" "}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="amount-input">

                        <span>
                          ₦
                        </span>

                        <input
                          name="transferAmount"
                          type="number"
                          min="0"
                          value={
                            form.transferAmount
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="0"
                        />

                      </div>

                    </div>

                  </div>

                </div>

              )}

            </div>

            {error && (

              <div className="error-message">
                <span>!</span>
                {error}
              </div>

            )}

            {distance !== null &&
              price !== null && (

              <div className="price-display">

                <div>
                  <span>
                    Road distance
                  </span>

                  <strong>
                    {distance} km
                  </strong>
                </div>

                <div>
                  <span>
                    Delivery price
                  </span>

                  <strong>
                    ₦
                    {Number(
                      price
                    ).toLocaleString()}
                  </strong>
                </div>

              </div>

            )}

            <div className="action-buttons">

              <button
                type="button"
                className="btn-calculate"
                onClick={calculatePrice}
                disabled={calculating}
              >
                {calculating
                  ? "Calculating route..."
                  : "Calculate delivery price →"}
              </button>

              {price !== null && (

                <button
                  type="submit"
                  className="btn-book"
                  disabled={booking}
                >
                  {booking
                    ? "Creating booking..."
                    : `Confirm booking • ₦${Number(
                        price
                      ).toLocaleString()}`}
                </button>

              )}

            </div>

          </form>

          <aside className="booking-sidebar-right">

            <div className="info-card map-card">

              <div className="map-grid" />

              <div className="map-route-visual">

                <span className="map-point pickup" />

                <div className="route-line">
                  <span />
                  <span />
                  <span />
                </div>

                <span className="map-point destination" />

              </div>

              <div className="map-label">
                <span>⌖</span>
                Delivery network
              </div>

            </div>

            <div className="info-card">

              <h3>
                Why Alejo?
              </h3>

              <div className="benefit-list">

                <div className="benefit-item">
                  <span>✓</span>
                  <p>
                    Verified delivery drivers
                  </p>
                </div>

                <div className="benefit-item">
                  <span>✓</span>
                  <p>
                    Live delivery tracking
                  </p>
                </div>

                <div className="benefit-item">
                  <span>✓</span>
                  <p>
                    Transparent pricing
                  </p>
                </div>

                <div className="benefit-item">
                  <span>✓</span>
                  <p>
                    Fast local delivery
                  </p>
                </div>

              </div>

            </div>

            {price !== null && (

              <div className="info-card price-summary">

                <small>
                  ESTIMATED DELIVERY
                </small>

                <strong>
                  ₦
                  {Number(
                    price
                  ).toLocaleString()}
                </strong>

                <span>
                  {distance} km road distance
                </span>

                <div className="payment-summary">

                  <small>
                    PAYMENT
                  </small>

                  <b>
                    {paymentMethod ===
                    "transfer"
                      ? "Bank Transfer"
                      : "Cash on Delivery"}
                  </b>

                </div>

              </div>

            )}

          </aside>

        </div>

      </main>

    </div>
  );
}

export default BookDelivery;
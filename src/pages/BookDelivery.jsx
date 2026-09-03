import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getCurrentUser,
} from "../utils/authStorage";

import {
  createDelivery,
} from "../utils/deliveryStorage";

import {
  calculateDeliveryPrice,
  getPricing,
} from "../utils/pricingStorage";

import Footer from "../components/Footer";

import "./BookDelivery.css";

function BookDelivery() {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [form, setForm] =
    useState({
      pickup: "",
      exactPickupAddress: "",

      destination: "",
      exactDestinationAddress: "",

      recipient: "",
      phone: "",

      packageType: "",
      description: "",

      driverNote: "",

      senderName: "",
      transferAmount: "",
    });

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [distance, setDistance] =
    useState(null);

  const [price, setPrice] =
    useState(null);

  const [calculating, setCalculating] =
    useState(false);

  const [booking, setBooking] =
    useState(false);

  const [error, setError] =
    useState("");

  const pricing =
    getPricing();

  useEffect(() => {
    const currentUser =
      getCurrentUser();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
  }, [navigate]);

  function updateField(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function getRoadDistance(
    from,
    to
  ) {
    const fromResponse =
      await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          from
        )}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    const fromData =
      await fromResponse.json();

    if (!fromData.length) {
      throw new Error(
        "Pickup location could not be found."
      );
    }

    const toResponse =
      await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          to
        )}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    const toData =
      await toResponse.json();

    if (!toData.length) {
      throw new Error(
        "Destination could not be found."
      );
    }

    const start =
      `${fromData[0].lon},${fromData[0].lat}`;

    const end =
      `${toData[0].lon},${toData[0].lat}`;

    const routeResponse =
      await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=false`
      );

    const routeData =
      await routeResponse.json();

    if (
      !routeData.routes ||
      !routeData.routes.length
    ) {
      throw new Error(
        "Could not calculate a driving route."
      );
    }

    return Number(
      (
        routeData.routes[0].distance /
        1000
      ).toFixed(1)
    );
  }

  async function calculatePrice() {
    if (
      !form.pickup.trim() ||
      !form.destination.trim()
    ) {
      setError(
        "Enter both pickup and destination."
      );

      return;
    }

    setError("");
    setCalculating(true);

    try {
      const km =
        await getRoadDistance(
          form.pickup.trim(),
          form.destination.trim()
        );

      const calculated =
        calculateDeliveryPrice(
          km,
          getPricing()
        );

      setDistance(km);
      setPrice(calculated);
    } catch (err) {
      console.error(err);

      setDistance(null);
      setPrice(null);

      setError(
        err.message ||
          "Could not calculate the route."
      );
    } finally {
      setCalculating(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (booking) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    if (
      !form.pickup.trim() ||
      !form.exactPickupAddress.trim() ||
      !form.destination.trim() ||
      !form.exactDestinationAddress.trim() ||
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
        "Calculate the delivery price before booking."
      );

      return;
    }

    if (!paymentMethod) {
      setError(
        "Please select a payment method."
      );

      return;
    }

    if (
      paymentMethod ===
      "transfer"
    ) {
      if (
        !form.senderName.trim()
      ) {
        setError(
          "Enter the transfer sender name."
        );

        return;
      }

      if (
        !form.transferAmount
      ) {
        setError(
          "Enter the transfer amount."
        );

        return;
      }

      const amount =
        Number(
          form.transferAmount
        );

      if (
        Number.isNaN(amount) ||
        amount < price
      ) {
        setError(
          `Transfer amount must be at least ₦${Number(
            price
          ).toLocaleString()}.`
        );

        return;
      }
    }

    setBooking(true);

    try {
      const finalPricing =
        getPricing();

      const isTransfer =
        paymentMethod ===
        "transfer";

      const deliveryId =
        `ALJ-${Date.now()}`;

      createDelivery({

        id: deliveryId,

        /* CUSTOMER */

        customerId:
          user.id,

        customerName:
          user.fullName || "",

        customerEmail:
          user.email || "",

        customerPhone:
          user.phone || "",

        /* LOCATIONS */

        pickup:
          form.pickup.trim(),

        exactPickupAddress:
          form.exactPickupAddress.trim(),

        destination:
          form.destination.trim(),

        exactDestinationAddress:
          form.exactDestinationAddress.trim(),

        /* RECIPIENT */

        recipient:
          form.recipient.trim(),

        phone:
          form.phone.trim(),

        recipientPhone:
          form.phone.trim(),

        /* PACKAGE */

        packageType:
          form.packageType,

        description:
          form.description.trim(),

        driverNote:
          form.driverNote.trim(),

        driverInstructions:
          form.driverNote.trim(),

        /* PRICING */

        distanceKm:
          distance,

        baseFee:
          finalPricing.baseFee,

        pricePerKm:
          finalPricing.pricePerKm,

        deliveryPrice:
          price,

        totalPrice:
          price,

        price:
          price,

        /* PAYMENT */

        paymentMethod:
          paymentMethod,

        paymentStatus:
          isTransfer
            ? "Pending"
            : "Pay on Delivery",

        transferSenderName:
          isTransfer
            ? form.senderName.trim()
            : null,

        transferAmount:
          isTransfer
            ? Number(
                form.transferAmount
              )
            : null,

        paymentConfirmed:
          false,

        /* STATUS */

        status:
          isTransfer
            ? "Awaiting Payment Confirmation"
            : "Pending",

        orderStatus:
          isTransfer
            ? "Awaiting Payment Confirmation"
            : "Pending",

        /* DRIVER */

        assignedDriverId:
          "",

        assignedDriverName:
          "",

        assignedDriverPhone:
          "",

        assignedDriverEmail:
          "",

        acceptedByDriver:
          false,

        driverFee:
          0,

        driverEarningsStatus:
          "Pending",

        createdAt:
          new Date().toISOString(),
      });

      navigate(
        "/customer-dashboard"
      );

    } catch (err) {
      console.error(
        "Delivery creation failed:",
        err
      );

      setError(
        "Could not create the delivery."
      );

      setBooking(false);
    }
  }

  return (
    <div className="booking-page">

      <header className="booking-topbar">

        <button
          className="booking-back"
          onClick={() =>
            navigate(
              "/customer-dashboard"
            )
          }
        >
          ← Dashboard
        </button>

        <div className="booking-brand">
          <strong>
            ALEJO
          </strong>

          <span>
            LOGISTICS
          </span>
        </div>

        <div className="booking-user">
          {user?.fullName}
        </div>

      </header>


      <main className="booking-main">

        <div className="booking-title">

          <span>
            DELIVERY BOOKING
          </span>

          <h1>
            Book a Delivery
          </h1>

          <p>
            Enter the complete pickup,
            destination and recipient
            information.
          </p>

        </div>


        {error && (
          <div className="booking-error">
            {error}
          </div>
        )}


        <div className="booking-content">

          <form
            className="booking-card"
            onSubmit={handleSubmit}
          >

            <section className="booking-section">

              <div className="booking-section-title">
                <b>01</b>

                <div>
                  <h2>
                    Delivery Route
                  </h2>

                  <p>
                    Tell us exactly where
                    the package is going.
                  </p>
                </div>
              </div>


              <div className="form-row">

                <label className="form-group">
                  Pickup Area
                  <input
                    value={
                      form.pickup
                    }
                    onChange={(e) =>
                      updateField(
                        "pickup",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Ikeja"
                    required
                  />
                </label>

                <label className="form-group">
                  Destination Area
                  <input
                    value={
                      form.destination
                    }
                    onChange={(e) =>
                      updateField(
                        "destination",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Yaba"
                    required
                  />
                </label>

              </div>


              <label className="form-group">
                Exact Pickup Address

                <input
                  value={
                    form.exactPickupAddress
                  }
                  onChange={(e) =>
                    updateField(
                      "exactPickupAddress",
                      e.target.value
                    )
                  }
                  placeholder="House number, street, landmark..."
                  required
                />
              </label>


              <label className="form-group">
                Exact Destination Address

                <input
                  value={
                    form.exactDestinationAddress
                  }
                  onChange={(e) =>
                    updateField(
                      "exactDestinationAddress",
                      e.target.value
                    )
                  }
                  placeholder="House number, street, landmark..."
                  required
                />
              </label>


              <button
                type="button"
                className="calculate-button"
                onClick={
                  calculatePrice
                }
                disabled={
                  calculating
                }
              >
                {calculating
                  ? "Calculating..."
                  : "Calculate Delivery Price"}
              </button>

            </section>


            <section className="booking-section">

              <div className="booking-section-title">
                <b>02</b>

                <div>
                  <h2>
                    Recipient &amp; Package
                  </h2>

                  <p>
                    Give the driver everything
                    needed to complete delivery.
                  </p>
                </div>
              </div>


              <div className="form-row">

                <label className="form-group">
                  Recipient Name

                  <input
                    value={
                      form.recipient
                    }
                    onChange={(e) =>
                      updateField(
                        "recipient",
                        e.target.value
                      )
                    }
                    placeholder="Recipient full name"
                    required
                  />
                </label>


                <label className="form-group">
                  Recipient Phone

                  <input
                    type="tel"
                    value={
                      form.phone
                    }
                    onChange={(e) =>
                      updateField(
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="080..."
                    required
                  />
                </label>

              </div>


              <div className="form-row">

                <label className="form-group">
                  Package Type

                  <select
                    value={
                      form.packageType
                    }
                    onChange={(e) =>
                      updateField(
                        "packageType",
                        e.target.value
                      )
                    }
                    required
                  >
                    <option value="">
                      Select package type
                    </option>

                    <option value="Documents">
                      Documents
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

                    <option value="Fragile">
                      Fragile Item
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>


                <label className="form-group">
                  Package Description

                  <input
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      updateField(
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="What is inside?"
                  />
                </label>

              </div>


              <label className="form-group">
                Driver Instructions

                <textarea
                  value={
                    form.driverNote
                  }
                  onChange={(e) =>
                    updateField(
                      "driverNote",
                      e.target.value
                    )
                  }
                  placeholder="Gate number, landmark, special instructions..."
                  rows="4"
                />
              </label>

            </section>


            <section className="booking-section">

              <div className="booking-section-title">
                <b>03</b>

                <div>
                  <h2>
                    Payment
                  </h2>

                  <p>
                    Choose how you want
                    to pay.
                  </p>
                </div>
              </div>


              <div className="payment-options">

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "transfer"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "transfer"
                    )
                  }
                >
                  <strong>
                    Bank Transfer
                  </strong>

                  <span>
                    Pay before delivery
                  </span>
                </button>


                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "cash"
                      ? "payment-option selected"
                      : "payment-option"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "cash"
                    )
                  }
                >
                  <strong>
                    Cash
                  </strong>

                  <span>
                    Pay on delivery
                  </span>
                </button>

              </div>


              {paymentMethod ===
                "transfer" && (

                <div className="transfer-box">

                  <h3>
                    Bank Transfer
                  </h3>

                  <div className="bank-details">

                    <div>
                      <span>
                        Bank
                      </span>

                      <strong>
                        Providus Bank
                      </strong>
                    </div>

                    <div>
                      <span>
                        Account Number
                      </span>

                      <strong>
                        9653727050
                      </strong>
                    </div>

                    <div>
                      <span>
                        Account Name
                      </span>

                      <strong>
                        Alejo Logistics
                      </strong>
                    </div>

                  </div>


                  <div className="form-row">

                    <label className="form-group">
                      Transfer Sender Name

                      <input
                        value={
                          form.senderName
                        }
                        onChange={(e) =>
                          updateField(
                            "senderName",
                            e.target.value
                          )
                        }
                        required
                      />
                    </label>


                    <label className="form-group">
                      Amount Transferred

                      <input
                        type="number"
                        min={price || 0}
                        value={
                          form.transferAmount
                        }
                        onChange={(e) =>
                          updateField(
                            "transferAmount",
                            e.target.value
                          )
                        }
                        required
                      />
                    </label>

                  </div>

                </div>

              )}

            </section>


            <button
              type="submit"
              className="book-submit"
              disabled={booking}
            >
              {booking
                ? "Booking..."
                : "Confirm Delivery Booking"}
            </button>

          </form>


          <aside className="booking-summary">

            <div className="summary-card">

              <span>
                ESTIMATED DELIVERY
              </span>

              <strong>
                {price === null
                  ? "—"
                  : `₦${Number(
                      price
                    ).toLocaleString()}`}
              </strong>

              {distance !== null && (
                <p>
                  {distance} km road distance
                </p>
              )}

              <div className="summary-line">
                <span>
                  Base Fee
                </span>

                <b>
                  ₦{Number(
                    pricing.baseFee
                  ).toLocaleString()}
                </b>
              </div>

              <div className="summary-line">
                <span>
                  Price / KM
                </span>

                <b>
                  ₦{Number(
                    pricing.pricePerKm
                  ).toLocaleString()}
                </b>
              </div>

              {paymentMethod && (
                <div className="summary-payment">
                  <span>
                    PAYMENT
                  </span>

                  <strong>
                    {paymentMethod ===
                    "transfer"
                      ? "Bank Transfer"
                      : "Cash on Delivery"}
                  </strong>
                </div>
              )}

            </div>


            <div className="summary-card">

              <h3>
                Your delivery includes
              </h3>

              <p>
                ✓ Exact pickup address
              </p>

              <p>
                ✓ Exact destination address
              </p>

              <p>
                ✓ Recipient information
              </p>

              <p>
                ✓ Driver instructions
              </p>

              <p>
                ✓ Road distance calculation
              </p>

              <p>
                ✓ Transparent pricing
              </p>

            </div>

          </aside>

        </div>

      </main>

      <Footer />

    </div>
  );
}

export default BookDelivery;
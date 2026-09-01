import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getDeliveries,
  saveDeliveries,
  assignDelivery,
  unassignDelivery,
  updateDeliveryStatus,
  approveDelivery,
  rejectDelivery,
  markDeliveryPaid,
  markCashToCollect,
} from "../utils/deliveryStorage";

import { getDrivers } from "../utils/driverStorage";

import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] =
    useState([]);

  const [drivers, setDrivers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [paymentFilter, setPaymentFilter] =
    useState("All");

  const [message, setMessage] =
    useState("");

  const [selectedDelivery, setSelectedDelivery] =
    useState(null);

  const [rejectingDelivery, setRejectingDelivery] =
    useState(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  // ==========================================
  // PROTECT ADMIN PAGE
  // ==========================================

  useEffect(() => {
    const authenticated =
      localStorage.getItem(
        "alejoAdminAuthenticated"
      );

    if (authenticated !== "true") {
      navigate("/login");
      return;
    }

    refresh();
  }, [navigate]);

  // ==========================================
  // REFRESH
  // ==========================================

  const refresh = () => {
    setDeliveries(getDeliveries());
    setDrivers(getDrivers());
  };

  // ==========================================
  // LOCK COMPLETED + PAID DELIVERY
  // ==========================================

  const isLocked = (delivery) => {
    return (
      delivery?.status === "Delivered" &&
      delivery?.paymentStatus === "Paid"
    );
  };

  // ==========================================
  // ASSIGN DRIVER
  // ==========================================

  const handleAssign = (
    deliveryId,
    driverId
  ) => {
    const delivery =
      deliveries.find(
        (item) =>
          item.id === deliveryId
      );

    if (!delivery) {
      return;
    }

    if (isLocked(delivery)) {
      setMessage(
        "This completed and paid delivery is locked."
      );
      return;
    }

    if (!driverId) {
      const updated =
        unassignDelivery(
          deliveryId
        );

      setDeliveries(updated);

      setSelectedDelivery(
        updated.find(
          (item) =>
            item.id === deliveryId
        ) || null
      );

      setMessage(
        "Driver assignment removed."
      );

      return;
    }

    const driver =
      drivers.find(
        (item) =>
          item.id === driverId
      );

    if (!driver) {
      return;
    }

    const updated =
      assignDelivery(
        deliveryId,
        driver
      );

    setDeliveries(updated);

    setSelectedDelivery(
      updated.find(
        (item) =>
          item.id === deliveryId
      ) || null
    );

    setMessage(
      `${driver.name} has been assigned to the delivery.`
    );
  };

  // ==========================================
  // APPROVE
  // ==========================================

  const handleApprove = (
    deliveryId
  ) => {
    const delivery =
      deliveries.find(
        (item) =>
          item.id === deliveryId
      );

    if (!delivery) {
      return;
    }

    if (isLocked(delivery)) {
      setMessage(
        "This completed and paid delivery is locked."
      );
      return;
    }

    if (
      delivery.paymentMethod ===
        "transfer" &&
      delivery.paymentStatus !==
        "Paid"
    ) {
      setMessage(
        "Confirm the bank transfer before approving this delivery."
      );
      return;
    }

    const updated =
      approveDelivery(
        deliveryId
      );

    setDeliveries(updated);

    setSelectedDelivery(
      updated.find(
        (item) =>
          item.id === deliveryId
      ) || null
    );

    setMessage(
      "Delivery approved successfully."
    );
  };

  // ==========================================
  // OPEN REJECT WARNING
  // ==========================================

  const openRejectWarning = (
    delivery
  ) => {
    if (isLocked(delivery)) {
      setMessage(
        "This completed and paid delivery is locked."
      );
      return;
    }

    setRejectingDelivery(delivery);
    setRejectionReason("");
  };

  // ==========================================
  // CONFIRM REJECTION
  // ==========================================

  const confirmReject = () => {
    if (!rejectingDelivery) {
      return;
    }

    if (isLocked(rejectingDelivery)) {
      setMessage(
        "This completed and paid delivery is locked."
      );

      setRejectingDelivery(null);
      return;
    }

    const updated =
      rejectDelivery(
        rejectingDelivery.id,
        rejectionReason.trim()
      );

    setDeliveries(updated);

    setSelectedDelivery(
      updated.find(
        (item) =>
          item.id ===
          rejectingDelivery.id
      ) || null
    );

    setMessage(
      `${rejectingDelivery.id} has been rejected.`
    );

    setRejectingDelivery(null);
    setRejectionReason("");
  };

  // ==========================================
  // MARK PAYMENT PAID
  // ==========================================

  const handleMarkPaid = (
    deliveryId
  ) => {
    const delivery =
      deliveries.find(
        (item) =>
          item.id === deliveryId
      );

    if (!delivery) {
      return;
    }

    if (isLocked(delivery)) {
      setMessage(
        "This delivery is already locked."
      );
      return;
    }

    const label =
      delivery.paymentMethod ===
      "transfer"
        ? "Bank Transfer"
        : "Cash";

    let updated =
      markDeliveryPaid(
        deliveryId,
        label
      );

    updated =
      updated.map((item) => {
        if (
          item.id !== deliveryId
        ) {
          return item;
        }

        if (
          item.paymentMethod ===
            "transfer" &&
          item.paymentStatus ===
            "Paid" &&
          item.status ===
            "Awaiting Payment Confirmation"
        ) {
          return {
            ...item,
            status: "Pending",
            orderStatus: "Pending",
            updatedAt:
              new Date().toISOString(),
          };
        }

        return item;
      });

    saveDeliveries(updated);

    setDeliveries(updated);

    setSelectedDelivery(
      updated.find(
        (item) =>
          item.id === deliveryId
      ) || null
    );

    setMessage(
      delivery.paymentMethod ===
        "transfer"
        ? "Bank transfer confirmed. Delivery is waiting for approval."
        : "Cash payment marked as paid."
    );
  };

  // ==========================================
  // CASH TO COLLECT
  // ==========================================

  const handleCashToCollect = (
    deliveryId
  ) => {
    const delivery =
      deliveries.find(
        (item) =>
          item.id === deliveryId
      );

    if (!delivery) {
      return;
    }

    if (isLocked(delivery)) {
      setMessage(
        "This completed and paid delivery is locked."
      );
      return;
    }

    if (
      delivery.paymentMethod !==
      "cash"
    ) {
      setMessage(
        "Cash to Collect is only for cash deliveries."
      );
      return;
    }

    const updated =
      markCashToCollect(
        deliveryId
      );

    setDeliveries(updated);

    setSelectedDelivery(
      updated.find(
        (item) =>
          item.id === deliveryId
      ) || null
    );

    setMessage(
      "Delivery marked as Cash to Collect."
    );
  };

  // ==========================================
  // STATUS CHANGE
  // ==========================================

  const handleStatusChange = (
    deliveryId,
    status
  ) => {
    const delivery =
      deliveries.find(
        (item) =>
          item.id === deliveryId
      );

    if (!delivery) {
      return;
    }

    if (isLocked(delivery)) {
      setMessage(
        "This completed and paid delivery is locked."
      );
      return;
    }

    if (
      status === "Approved" &&
      delivery.paymentMethod ===
        "transfer" &&
      delivery.paymentStatus !==
        "Paid"
    ) {
      setMessage(
        "Confirm the bank transfer before approval."
      );
      return;
    }

    const updated =
      updateDeliveryStatus(
        deliveryId,
        status
      );

    setDeliveries(updated);

    setSelectedDelivery(
      updated.find(
        (item) =>
          item.id === deliveryId
      ) || null
    );

    setMessage(
      `Delivery status changed to ${status}.`
    );
  };

  // ==========================================
  // SEARCH + FILTER
  // ==========================================

  const filteredDeliveries =
    useMemo(() => {
      return deliveries.filter(
        (delivery) => {
          const text =
            search
              .trim()
              .toLowerCase();

          const customerName =
            delivery.customerName ||
            delivery.fullName ||
            "";

          const customerEmail =
            delivery.customerEmail ||
            delivery.email ||
            "";

          const customerPhone =
            delivery.customerPhone ||
            delivery.phone ||
            "";

          const searchable = [
            delivery.id,
            customerName,
            customerEmail,
            customerPhone,
            delivery.recipient,
            delivery.pickup,
            delivery.exactPickupAddress,
            delivery.destination,
            delivery.exactAddress,
            delivery.assignedDriverName,
            delivery.driverNote,
            delivery.packageType,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !text ||
            searchable.includes(text);

          const matchesStatus =
            statusFilter === "All" ||
            delivery.status ===
              statusFilter;

          const matchesPayment =
            paymentFilter === "All" ||
            delivery.paymentStatus ===
              paymentFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPayment
          );
        }
      );
    }, [
      deliveries,
      search,
      statusFilter,
      paymentFilter,
    ]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const pending =
    deliveries.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const awaitingPayment =
    deliveries.filter(
      (item) =>
        item.status ===
        "Awaiting Payment Confirmation"
    ).length;

  const active =
    deliveries.filter(
      (item) =>
        item.status ===
          "Accepted" ||
        item.status ===
          "Picked Up" ||
        item.status ===
          "In Transit"
    ).length;

  const completed =
    deliveries.filter(
      (item) =>
        item.status === "Delivered"
    ).length;

  const assigned =
    deliveries.filter(
      (item) =>
        item.assignedDriverId
    ).length;

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem(
      "alejoAdminAuthenticated"
    );

    navigate("/login");
  };

  // ==========================================
  // MONEY
  // ==========================================

  const formatMoney = (amount) =>
    `₦${Number(
      amount || 0
    ).toLocaleString()}`;

  // ==========================================
  // CLOSE DETAILS
  // ==========================================

  const closeDetails = () => {
    setSelectedDelivery(null);
  };

  return (
    <div className="admin-page">

      {/* HEADER */}

      <header className="admin-header">

        <div>

          <p className="admin-label">
            ALEJO LOGISTICS
          </p>

          <h1>
            Operations Dashboard
          </h1>

          <p>
            Manage deliveries,
            drivers and payments.
          </p>

        </div>

        <div className="admin-header-actions">

          <button
            className="admin-pricing-button"
            onClick={() =>
              navigate(
                "/admin-pricing"
              )
            }
          >
            Pricing Settings
          </button>

          <button
            className="admin-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* MESSAGE */}

      {message && (
        <div className="admin-message">

          <span>
            {message}
          </span>

          <button
            onClick={() =>
              setMessage("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* STATS */}

      <section className="admin-stats">

        <div className="admin-stat">
          <span>
            Total Deliveries
          </span>

          <strong>
            {deliveries.length}
          </strong>
        </div>

        <div className="admin-stat pending">
          <span>
            Pending
          </span>

          <strong>
            {pending}
          </strong>
        </div>

        <div className="admin-stat">
          <span>
            Awaiting Payment
          </span>

          <strong>
            {awaitingPayment}
          </strong>
        </div>

        <div className="admin-stat active">
          <span>
            Active
          </span>

          <strong>
            {active}
          </strong>
        </div>

        <div className="admin-stat completed">
          <span>
            Delivered
          </span>

          <strong>
            {completed}
          </strong>
        </div>

      </section>

      {/* DELIVERY MANAGEMENT */}

      <section className="admin-panel">

        <div className="admin-panel-header">

          <div>

            <p className="admin-label">
              DISPATCH
            </p>

            <h2>
              Delivery Management
            </h2>

          </div>

          <span className="delivery-count">
            {assigned} assigned
          </span>

        </div>

        {/* FILTERS */}

        <div className="admin-filters">

          <input
            type="text"
            placeholder="Search delivery, customer, address or driver..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Statuses
            </option>

            <option value="Awaiting Payment Confirmation">
              Awaiting Payment
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Approved">
              Approved
            </option>

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

            <option value="Rejected">
              Rejected
            </option>

          </select>

          <select
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Payments
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Awaiting Payment">
              Awaiting Payment
            </option>

            <option value="Pay on Delivery">
              Pay on Delivery
            </option>

            <option value="Cash to Collect">
              Cash to Collect
            </option>

            <option value="Paid">
              Paid
            </option>

          </select>

          <button
            className="clear-filter-button"
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setPaymentFilter("All");
            }}
          >
            Clear
          </button>

        </div>

        <div className="admin-results-info">

          Showing{" "}

          <strong>
            {filteredDeliveries.length}
          </strong>{" "}

          of{" "}

          <strong>
            {deliveries.length}
          </strong>{" "}

          deliveries

        </div>

        {/* DELIVERY LIST */}

        {filteredDeliveries.length === 0 ? (

          <div className="admin-empty">

            <div className="admin-empty-icon">
              📦
            </div>

            <h3>
              No deliveries found
            </h3>

            <p>
              Customer bookings will appear here.
            </p>

          </div>

        ) : (

          <div className="delivery-cards">

            {filteredDeliveries.map(
              (delivery) => {

                const locked =
                  isLocked(delivery);

                const customerName =
                  delivery.customerName ||
                  delivery.fullName ||
                  delivery.recipient ||
                  "Unknown Customer";

                const statusClass =
                  delivery.status
                    ?.toLowerCase()
                    .replace(/\s+/g, "-") ||
                  "pending";

                const paymentClass =
                  delivery.paymentStatus
                    ?.toLowerCase()
                    .replace(/\s+/g, "-") ||
                  "unpaid";

                return (
                  <button
                    type="button"
                    className={`delivery-list-item ${
                      locked
                        ? "locked"
                        : ""
                    }`}
                    key={delivery.id}
                    onClick={() =>
                      setSelectedDelivery(
                        delivery
                      )
                    }
                  >

                    <div className="delivery-list-main">

                      <div className="delivery-list-id">

                        <strong>
                          {delivery.id}
                        </strong>

                        <span>
                          {delivery.packageType ||
                            "Package"}
                        </span>

                      </div>

                      <div className="delivery-list-route">

                        <span>
                          {delivery.pickup ||
                            "No pickup"}
                        </span>

                        <b>
                          →
                        </b>

                        <span>
                          {delivery.destination ||
                            "No destination"}
                        </span>

                      </div>

                      <div className="delivery-list-customer">

                        <strong>
                          {customerName}
                        </strong>

                        <small>
                          {delivery.recipient ||
                            "No recipient"}
                        </small>

                      </div>

                    </div>

                    <div className="delivery-list-right">

                      <span
                        className={`status ${statusClass}`}
                      >
                        {delivery.status}
                      </span>

                      <span
                        className={`payment-status ${paymentClass}`}
                      >
                        {delivery.paymentStatus ||
                          "Unpaid"}
                      </span>

                      <strong>
                        {formatMoney(
                          delivery.deliveryPrice ||
                            delivery.totalPrice ||
                            delivery.price
                        )}
                      </strong>

                      {locked && (
                        <span className="locked-label">
                          🔒 Locked
                        </span>
                      )}

                      <span className="view-arrow">
                        View →
                      </span>

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* DELIVERY DETAILS MODAL */}

      {selectedDelivery && (

        <div
          className="admin-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="delivery-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="details-modal-header">

              <div>

                <p className="admin-label">
                  DELIVERY DETAILS
                </p>

                <h2>
                  {selectedDelivery.id}
                </h2>

                <span>
                  {selectedDelivery.createdAt
                    ? new Date(
                        selectedDelivery.createdAt
                      ).toLocaleString()
                    : ""}
                </span>

              </div>

              <button
                className="details-close"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>

            {/* LOCKED */}

            {isLocked(
              selectedDelivery
            ) && (

              <div className="locked-banner">
                🔒 This delivery is completed
                and paid. All administrative
                controls are locked.
              </div>

            )}

            {/* CUSTOMER + RECIPIENT */}

            <div className="details-grid">

              <div className="detail-box">

                <h3>
                  Customer
                </h3>

                <Detail
                  label="Name"
                  value={
                    selectedDelivery.customerName ||
                    selectedDelivery.fullName
                  }
                />

                <Detail
                  label="Email"
                  value={
                    selectedDelivery.customerEmail ||
                    selectedDelivery.email
                  }
                />

                <Detail
                  label="Phone"
                  value={
                    selectedDelivery.customerPhone ||
                    selectedDelivery.phone
                  }
                />

              </div>

              <div className="detail-box">

                <h3>
                  Recipient
                </h3>

                <Detail
                  label="Name"
                  value={
                    selectedDelivery.recipient
                  }
                />

                <Detail
                  label="Phone"
                  value={
                    selectedDelivery.recipientPhone ||
                    selectedDelivery.recipientPhoneNumber ||
                    "Not provided"
                  }
                />

                <Detail
                  label="Package"
                  value={
                    selectedDelivery.packageType
                  }
                />

              </div>

            </div>

            {/* PICKUP */}

            <div className="detail-box route-detail-box">

              <h3>
                📍 Pickup
              </h3>

              <Detail
                label="Area"
                value={
                  selectedDelivery.pickup
                }
              />

              <Detail
                label="Exact address"
                value={
                  selectedDelivery.exactPickupAddress ||
                  "No exact pickup address recorded."
                }
              />

            </div>

            {/* DESTINATION */}

            <div className="detail-box route-detail-box">

              <h3>
                🏁 Destination
              </h3>

              <Detail
                label="Area"
                value={
                  selectedDelivery.destination
                }
              />

              <Detail
                label="Exact address"
                value={
                  selectedDelivery.exactAddress ||
                  "No exact destination address recorded."
                }
              />

            </div>

            {/* DRIVER NOTE */}

            <div className="detail-box instruction-box">

              <h3>
                🗣️ What should the driver know?
              </h3>

              <p>
                {selectedDelivery.driverNote ||
                  "No driver instructions provided."}
              </p>

            </div>

            {/* PAYMENT + DRIVER */}

            <div className="details-grid">

              <div className="detail-box">

                <h3>
                  Payment
                </h3>

                <Detail
                  label="Method"
                  value={
                    selectedDelivery.paymentMethod ===
                    "transfer"
                      ? "Bank Transfer"
                      : "Cash on Delivery"
                  }
                />

                <Detail
                  label="Status"
                  value={
                    selectedDelivery.paymentStatus
                  }
                />

                <Detail
                  label="Delivery price"
                  value={formatMoney(
                    selectedDelivery.deliveryPrice ||
                      selectedDelivery.totalPrice ||
                      selectedDelivery.price
                  )}
                />

                {selectedDelivery.paymentMethod ===
                  "transfer" && (
                  <>
                    <Detail
                      label="Transfer sender"
                      value={
                        selectedDelivery.transferSenderName ||
                        "Not provided"
                      }
                    />

                    <Detail
                      label="Amount transferred"
                      value={formatMoney(
                        selectedDelivery.transferAmount
                      )}
                    />
                  </>
                )}

              </div>

              <div className="detail-box">

                <h3>
                  Driver
                </h3>

                <Detail
                  label="Assigned driver"
                  value={
                    selectedDelivery.assignedDriverName ||
                    "Not assigned"
                  }
                />

                <Detail
                  label="Driver fee"
                  value={formatMoney(
                    selectedDelivery.driverFee
                  )}
                />

                <Detail
                  label="Distance"
                  value={
                    selectedDelivery.distanceKm
                      ? `${selectedDelivery.distanceKm} km`
                      : "Not available"
                  }
                />

              </div>

            </div>

            {/* ADMIN CONTROLS */}

            {!isLocked(
              selectedDelivery
            ) && (

              <div className="details-controls">

                <div className="control-section">

                  <label>
                    Assign driver
                  </label>

                  <select
                    value={
                      selectedDelivery.assignedDriverId ||
                      ""
                    }
                    disabled={
                      selectedDelivery.status ===
                      "Rejected"
                    }
                    onChange={(e) =>
                      handleAssign(
                        selectedDelivery.id,
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select Driver
                    </option>

                    {drivers.map(
                      (driver) => (
                        <option
                          key={driver.id}
                          value={driver.id}
                        >
                          {driver.name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div className="control-section">

                  <label>
                    Delivery status
                  </label>

                  <select
                    value={
                      selectedDelivery.status ||
                      "Pending"
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        selectedDelivery.id,
                        e.target.value
                      )
                    }
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Approved">
                      Approved
                    </option>

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

                    <option value="Rejected">
                      Rejected
                    </option>

                  </select>

                </div>

              </div>
            )}

            {/* ACTION BUTTONS */}

            {!isLocked(
              selectedDelivery
            ) && (

              <div className="details-action-buttons">

                {/* BANK TRANSFER */}

                {selectedDelivery.paymentMethod ===
                  "transfer" &&
                  selectedDelivery.paymentStatus !==
                    "Paid" && (

                  <button
                    className="payment-button"
                    onClick={() =>
                      handleMarkPaid(
                        selectedDelivery.id
                      )
                    }
                  >
                    ✓ Confirm Bank Transfer
                  </button>

                )}

                {/* CASH TO COLLECT */}

                {selectedDelivery.paymentMethod ===
                  "cash" &&
                  selectedDelivery.paymentStatus !==
                    "Paid" &&
                  selectedDelivery.paymentStatus !==
                    "Cash to Collect" && (

                  <button
                    className="cash-button"
                    onClick={() =>
                      handleCashToCollect(
                        selectedDelivery.id
                      )
                    }
                  >
                    💵 Cash to Collect
                  </button>

                )}

                {/* MARK CASH PAID */}

                {selectedDelivery.paymentMethod ===
                  "cash" &&
                  selectedDelivery.paymentStatus !==
                    "Paid" && (

                  <button
                    className="payment-button"
                    onClick={() =>
                      handleMarkPaid(
                        selectedDelivery.id
                      )
                    }
                  >
                    ✓ Mark Cash Paid
                  </button>

                )}

                {/* APPROVE */}

                {selectedDelivery.status ===
                  "Pending" && (

                  <button
                    className="approve-button"
                    onClick={() =>
                      handleApprove(
                        selectedDelivery.id
                      )
                    }
                  >
                    ✓ Approve Delivery
                  </button>

                )}

                {/* REJECT */}

                {(selectedDelivery.status ===
                  "Pending" ||
                  selectedDelivery.status ===
                    "Approved") && (

                  <button
                    className="reject-button"
                    onClick={() =>
                      openRejectWarning(
                        selectedDelivery
                      )
                    }
                  >
                    Reject Delivery
                  </button>

                )}

              </div>
            )}

          </div>

        </div>
      )}

      {/* REJECTION MODAL */}

      {rejectingDelivery && (

        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-icon">
              ⚠️
            </div>

            <h2>
              Reject Delivery?
            </h2>

            <p>
              Are you sure you want to reject{" "}
              <strong>
                {rejectingDelivery.id}
              </strong>
              ?
            </p>

            <div className="admin-modal-field">

              <label>
                Reason
              </label>

              <textarea
                value={rejectionReason}
                onChange={(e) =>
                  setRejectionReason(
                    e.target.value
                  )
                }
                placeholder="Example: Service unavailable in this area..."
                rows="3"
              />

            </div>

            <div className="admin-modal-actions">

              <button
                className="cancel-reject"
                onClick={() => {
                  setRejectingDelivery(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>

              <button
                className="confirm-reject"
                onClick={confirmReject}
              >
                Yes, Reject Delivery
              </button>

            </div>

          </div>

        </div>
      )}

      {/* COMPANY FOOTER */}

      <footer className="admin-footer">

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
          Bank: Providus Bank
        </span>

        <span>
          Account: 9653727050
        </span>

      </footer>

    </div>
  );
}

// ==========================================
// DETAIL COMPONENT
// ==========================================

function Detail({
  label,
  value,
}) {
  return (
    <div className="detail-row">

      <span>
        {label}
      </span>

      <strong>
        {value || "Not provided"}
      </strong>

    </div>
  );
}

export default AdminDashboard;
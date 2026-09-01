// src/utils/deliveryStorage.js

const DELIVERY_KEY = "alejoDeliveries";

/* =========================================================
   INTERNAL HELPERS
========================================================= */

function generateId() {
  return (
    "DEL-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 7).toUpperCase()
  );
}

function normalizeDelivery(delivery) {
  return {
    id: delivery.id || generateId(),

    customerId: delivery.customerId || "",
    customerName: delivery.customerName || "",
    customerEmail: delivery.customerEmail || "",

    pickupAddress: delivery.pickupAddress || "",
    deliveryAddress: delivery.deliveryAddress || "",

    pickupLocation: delivery.pickupLocation || null,
    deliveryLocation: delivery.deliveryLocation || null,

    distanceKm: Number(delivery.distanceKm) || 0,

    packageType: delivery.packageType || "Package",

    price: Number(delivery.price) || 0,
    deliveryFee: Number(delivery.deliveryFee) || Number(delivery.price) || 0,

    paymentMethod: delivery.paymentMethod || "transfer",
    paymentStatus: delivery.paymentStatus || "Pending",

    status: delivery.status || "Pending",

    driverId: delivery.driverId || null,
    driverName: delivery.driverName || "",
    driverPhone: delivery.driverPhone || "",

    driverFee: Number(delivery.driverFee) || 0,
    cashToCollect: Boolean(delivery.cashToCollect),

    approved: Boolean(delivery.approved),
    rejected: Boolean(delivery.rejected),

    rejectionReason: delivery.rejectionReason || "",

    createdAt: delivery.createdAt || new Date().toISOString(),
    updatedAt: delivery.updatedAt || new Date().toISOString(),

    acceptedAt: delivery.acceptedAt || null,
    assignedAt: delivery.assignedAt || null,
    pickedUpAt: delivery.pickedUpAt || null,
    deliveredAt: delivery.deliveredAt || null,
    releasedAt: delivery.releasedAt || null,
  };
}

/* =========================================================
   GET / SAVE
========================================================= */

export function getDeliveries() {
  try {
    const saved = localStorage.getItem(DELIVERY_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeDelivery);
  } catch (error) {
    console.error("Error loading deliveries:", error);
    return [];
  }
}

export function saveDeliveries(deliveries) {
  try {
    const safeDeliveries = Array.isArray(deliveries)
      ? deliveries.map(normalizeDelivery)
      : [];

    localStorage.setItem(
      DELIVERY_KEY,
      JSON.stringify(safeDeliveries)
    );

    return safeDeliveries;
  } catch (error) {
    console.error("Error saving deliveries:", error);
    return [];
  }
}

/* =========================================================
   GET ONE DELIVERY
========================================================= */

export function getDeliveryById(deliveryId) {
  if (!deliveryId) {
    return null;
  }

  const deliveries = getDeliveries();

  return (
    deliveries.find(
      (delivery) => String(delivery.id) === String(deliveryId)
    ) || null
  );
}

/* =========================================================
   CREATE DELIVERY
========================================================= */

export function createDelivery(deliveryData = {}) {
  const deliveries = getDeliveries();

  const delivery = normalizeDelivery({
    ...deliveryData,

    id: deliveryData.id || generateId(),

    status: deliveryData.status || "Pending",

    paymentStatus:
      deliveryData.paymentStatus || "Pending",

    createdAt:
      deliveryData.createdAt || new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  });

  deliveries.unshift(delivery);

  saveDeliveries(deliveries);

  return delivery;
}

/* =========================================================
   UPDATE DELIVERY
========================================================= */

function updateDelivery(deliveryId, changes = {}) {
  const deliveries = getDeliveries();

  const index = deliveries.findIndex(
    (delivery) =>
      String(delivery.id) === String(deliveryId)
  );

  if (index === -1) {
    return null;
  }

  deliveries[index] = normalizeDelivery({
    ...deliveries[index],
    ...changes,
    updatedAt: new Date().toISOString(),
  });

  saveDeliveries(deliveries);

  return deliveries[index];
}

/* =========================================================
   ASSIGN DELIVERY
========================================================= */

export function assignDelivery(deliveryId, driver) {
  if (!driver) {
    return null;
  }

  return updateDelivery(deliveryId, {
    driverId:
      driver.id ||
      driver.driverId ||
      null,

    driverName:
      driver.name ||
      driver.fullName ||
      driver.driverName ||
      "",

    driverPhone:
      driver.phone ||
      driver.phoneNumber ||
      driver.driverPhone ||
      "",

    assignedAt: new Date().toISOString(),

    status: "Assigned",

    approved: true,
    rejected: false,
  });
}

/* =========================================================
   UNASSIGN DELIVERY
========================================================= */

export function unassignDelivery(deliveryId) {
  return updateDelivery(deliveryId, {
    driverId: null,
    driverName: "",
    driverPhone: "",
    assignedAt: null,

    status: "Pending",
  });
}

/* =========================================================
   DRIVER ACCEPT DELIVERY
========================================================= */

export function acceptDelivery(deliveryId, driver) {
  if (!driver) {
    return null;
  }

  const delivery = getDeliveryById(deliveryId);

  if (!delivery) {
    return null;
  }

  /*
    If the admin has already assigned this order to another
    driver, don't allow another driver to take it.
  */

  if (
    delivery.driverId &&
    String(delivery.driverId) !==
      String(driver.id || driver.driverId)
  ) {
    return null;
  }

  return updateDelivery(deliveryId, {
    driverId:
      driver.id ||
      driver.driverId ||
      delivery.driverId,

    driverName:
      driver.name ||
      driver.fullName ||
      driver.driverName ||
      delivery.driverName,

    driverPhone:
      driver.phone ||
      driver.phoneNumber ||
      driver.driverPhone ||
      delivery.driverPhone,

    status: "Accepted",

    acceptedAt: new Date().toISOString(),

    rejected: false,
  });
}

/* =========================================================
   RELEASE / COMPLETE DELIVERY
========================================================= */

export function releaseDelivery(deliveryId) {
  const delivery = getDeliveryById(deliveryId);

  if (!delivery) {
    return null;
  }

  return updateDelivery(deliveryId, {
    status: "Released",
    releasedAt: new Date().toISOString(),
  });
}

/* =========================================================
   UPDATE STATUS
========================================================= */

export function updateDeliveryStatus(
  deliveryId,
  status
) {
  if (!deliveryId || !status) {
    return null;
  }

  const changes = {
    status,
  };

  if (status === "Picked Up") {
    changes.pickedUpAt = new Date().toISOString();
  }

  if (status === "Delivered") {
    changes.deliveredAt = new Date().toISOString();
  }

  return updateDelivery(deliveryId, changes);
}

/* =========================================================
   APPROVE DELIVERY
========================================================= */

export function approveDelivery(deliveryId) {
  return updateDelivery(deliveryId, {
    approved: true,
    rejected: false,
    rejectionReason: "",

    status: "Approved",
  });
}

/* =========================================================
   REJECT DELIVERY
========================================================= */

export function rejectDelivery(
  deliveryId,
  reason = ""
) {
  return updateDelivery(deliveryId, {
    approved: false,
    rejected: true,

    rejectionReason: reason,

    status: "Rejected",
  });
}

/* =========================================================
   MARK DELIVERY AS PAID
========================================================= */

export function markDeliveryPaid(deliveryId) {
  return updateDelivery(deliveryId, {
    paymentStatus: "Paid",
  });
}

/* =========================================================
   MARK CASH TO COLLECT
========================================================= */

export function markCashToCollect(
  deliveryId,
  value = true
) {
  return updateDelivery(deliveryId, {
    cashToCollect: Boolean(value),

    paymentStatus: value
      ? "Cash to Collect"
      : "Pending",
  });
}

/* =========================================================
   DELETE DELIVERY
========================================================= */

export function deleteDelivery(deliveryId) {
  const deliveries = getDeliveries();

  const filtered = deliveries.filter(
    (delivery) =>
      String(delivery.id) !== String(deliveryId)
  );

  saveDeliveries(filtered);

  return filtered;
}

/* =========================================================
   CLEAR ALL DELIVERIES
========================================================= */

export function clearDeliveries() {
  localStorage.removeItem(DELIVERY_KEY);
  return [];
}
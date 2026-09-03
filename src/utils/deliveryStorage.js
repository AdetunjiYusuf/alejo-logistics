const DELIVERY_KEY = "alejoDeliveries";

/* ============================================
   GET ALL
============================================ */

export function getDeliveries() {
  try {
    const saved =
      localStorage.getItem(
        DELIVERY_KEY
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Could not load deliveries:",
      error
    );

    return [];
  }
}


/* ============================================
   SAVE ALL
============================================ */

export function saveDeliveries(
  deliveries
) {
  const safe =
    Array.isArray(deliveries)
      ? deliveries
      : [];

  localStorage.setItem(
    DELIVERY_KEY,
    JSON.stringify(safe)
  );

  return safe;
}


/* ============================================
   GET ONE
============================================ */

export function getDeliveryById(
  deliveryId
) {
  return getDeliveries().find(
    (delivery) =>
      delivery.id === deliveryId
  ) || null;
}


/* ============================================
   CREATE
============================================ */

export function createDelivery(
  data
) {
  const deliveries =
    getDeliveries();

  const now =
    new Date().toISOString();

  const price = Number(
    data.totalPrice ??
      data.deliveryPrice ??
      data.price ??
      0
  );

  const paymentMethod =
    data.paymentMethod || "";

  const delivery = {
    /* =========================
       ID
    ========================= */

    id:
      data.id ||
      `ALJ-${Date.now()}`,

    /* =========================
       CUSTOMER
    ========================= */

    customerId:
      data.customerId || "",

    customerName:
      data.customerName || "",

    customerEmail:
      data.customerEmail || "",

    customerPhone:
      data.customerPhone || "",

    /* =========================
       LOCATIONS
    ========================= */

    pickup:
      data.pickup || "",

    exactPickupAddress:
      data.exactPickupAddress ||
      data.pickupAddress ||
      "",

    destination:
      data.destination || "",

    exactDestinationAddress:
      data.exactDestinationAddress ||
      data.destinationAddress ||
      data.exactAddress ||
      "",

    /* =========================
       RECIPIENT
    ========================= */

    recipient:
      data.recipient || "",

    phone:
      data.phone ||
      data.recipientPhone ||
      "",

    recipientPhone:
      data.recipientPhone ||
      data.phone ||
      "",

    /* =========================
       PACKAGE
    ========================= */

    packageType:
      data.packageType || "",

    description:
      data.description || "",

    driverNote:
      data.driverNote ||
      data.driverInstructions ||
      "",

    driverInstructions:
      data.driverInstructions ||
      data.driverNote ||
      "",

    /* =========================
       DISTANCE
    ========================= */

    distanceKm:
      Number(data.distanceKm) || 0,

    /* =========================
       PRICING
    ========================= */

    baseFee:
      Number(data.baseFee) || 0,

    pricePerKm:
      Number(data.pricePerKm) || 0,

    deliveryPrice:
      price,

    totalPrice:
      price,

    price:
      price,

    /* =========================
       PAYMENT
    ========================= */

    paymentMethod,

    paymentStatus:
      data.paymentStatus ||
      (
        paymentMethod === "transfer"
          ? "Pending"
          : "Pay on Delivery"
      ),

    paymentReference:
      data.paymentReference ||
      null,

    transferSenderName:
      data.transferSenderName ||
      null,

    transferAmount:
      data.transferAmount != null
        ? Number(
            data.transferAmount
          )
        : null,

    paymentConfirmed:
      Boolean(
        data.paymentConfirmed
      ),

    paymentConfirmedAt:
      data.paymentConfirmedAt ||
      null,

    paymentConfirmedBy:
      data.paymentConfirmedBy ||
      null,

    paidAt:
      data.paidAt || null,

    /* =========================
       STATUS
    ========================= */

    status:
      data.status || "Pending",

    orderStatus:
      data.orderStatus ||
      data.status ||
      "Pending",

    rejectionReason:
      data.rejectionReason || "",

    /* =========================
       DRIVER
    ========================= */

    assignedDriverId:
      data.assignedDriverId || "",

    assignedDriverName:
      data.assignedDriverName || "",

    assignedDriverPhone:
      data.assignedDriverPhone || "",

    assignedDriverEmail:
      data.assignedDriverEmail || "",

    acceptedByDriver:
      Boolean(
        data.acceptedByDriver
      ),

    acceptedAt:
      data.acceptedAt || null,

    driverFee:
      Number(data.driverFee) || 0,

    driverEarningsStatus:
      data.driverEarningsStatus ||
      "Pending",

    /* =========================
       DATES
    ========================= */

    createdAt:
      data.createdAt || now,

    updatedAt: now,

    approvedAt:
      data.approvedAt || null,

    rejectedAt:
      data.rejectedAt || null,

    deliveredAt:
      data.deliveredAt || null,
  };

  deliveries.push(
    delivery
  );

  saveDeliveries(
    deliveries
  );

  return delivery;
}


/* ============================================
   ASSIGN DRIVER
============================================ */

export function assignDelivery(
  deliveryId,
  driver
) {
  const deliveries =
    getDeliveries();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        return {
          ...delivery,

          assignedDriverId:
            driver?.id || "",

          assignedDriverName:
            driver?.name ||
            driver?.fullName ||
            "",

          assignedDriverPhone:
            driver?.phone || "",

          assignedDriverEmail:
            driver?.email || "",

          acceptedByDriver:
            false,

          acceptedAt: null,

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}


/* ============================================
   UNASSIGN
============================================ */

export function unassignDelivery(
  deliveryId
) {
  const deliveries =
    getDeliveries();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        return {
          ...delivery,

          assignedDriverId: "",
          assignedDriverName: "",
          assignedDriverPhone: "",
          assignedDriverEmail: "",

          acceptedByDriver:
            false,

          acceptedAt: null,

          status:
            delivery.status ===
              "Delivered"
              ? "Delivered"
              : "Approved",

          orderStatus:
            delivery.status ===
              "Delivered"
              ? "Delivered"
              : "Approved",

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}


/* ============================================
   APPROVE
============================================ */

export function approveDelivery(
  deliveryId
) {
  const deliveries =
    getDeliveries();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        return {
          ...delivery,

          status: "Approved",
          orderStatus: "Approved",

          rejectionReason: "",
          rejectedAt: null,

          approvedAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}


/* ============================================
   REJECT
============================================ */

export function rejectDelivery(
  deliveryId,
  reason = ""
) {
  const deliveries =
    getDeliveries();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        return {
          ...delivery,

          status: "Rejected",
          orderStatus: "Rejected",

          rejectionReason:
            reason,

          rejectedAt:
            new Date().toISOString(),

          assignedDriverId: "",
          assignedDriverName: "",
          assignedDriverPhone: "",
          assignedDriverEmail: "",

          acceptedByDriver:
            false,

          acceptedAt: null,

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}


/* ============================================
   MARK PAID
============================================ */

export function markDeliveryPaid(
  deliveryId,
  paymentMethod = "Bank Transfer"
) {
  const deliveries =
    getDeliveries();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        return {
          ...delivery,

          paymentStatus:
            "Paid",

          paymentMethod,

          paymentConfirmed:
            true,

          paymentConfirmedAt:
            new Date().toISOString(),

          paidAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}


/* ============================================
   CASH TO COLLECT
============================================ */

export function markCashToCollect(
  deliveryId
) {
  const deliveries =
    getDeliveries();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        return {
          ...delivery,

          paymentStatus:
            "Cash to Collect",

          paymentMethod:
            "cash",

          paymentConfirmed:
            false,

          paidAt: null,

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}


/* ============================================
   DRIVER ACCEPT
============================================ */

export function acceptDelivery(
  deliveryId,
  driver
) {
  const deliveries =
    getDeliveries();

  const delivery =
    deliveries.find(
      (item) =>
        item.id ===
        deliveryId
    );

  if (!delivery) {
    return {
      success: false,
      message:
        "Delivery not found.",
      deliveries,
    };
  }

  if (
    delivery.status ===
    "Rejected"
  ) {
    return {
      success: false,
      message:
        "This delivery was rejected.",
      deliveries,
    };
  }

  if (
    delivery.acceptedByDriver &&
    delivery.assignedDriverId !==
      driver?.id
  ) {
    return {
      success: false,
      message:
        "Another driver has already accepted this delivery.",
      deliveries,
    };
  }

  if (
    delivery.assignedDriverId &&
    delivery.assignedDriverId !==
      driver?.id
  ) {
    return {
      success: false,
      message:
        "This delivery is assigned to another driver.",
      deliveries,
    };
  }

  const updated =
    deliveries.map(
      (item) => {
        if (
          item.id !==
          deliveryId
        ) {
          return item;
        }

        return {
          ...item,

          assignedDriverId:
            driver?.id || "",

          assignedDriverName:
            driver?.name ||
            driver?.fullName ||
            "",

          assignedDriverPhone:
            driver?.phone || "",

          assignedDriverEmail:
            driver?.email || "",

          acceptedByDriver:
            true,

          acceptedAt:
            new Date().toISOString(),

          status: "Accepted",

          orderStatus:
            "Accepted",

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return {
    success: true,

    message:
      "Delivery accepted successfully.",

    deliveries: updated,
  };
}


/* ============================================
   DRIVER RELEASE
============================================ */

export function releaseDelivery(
  deliveryId,
  driver
) {
  const deliveries =
    getDeliveries();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        if (
          delivery.assignedDriverId !==
          driver?.id
        ) {
          return delivery;
        }

        return {
          ...delivery,

          assignedDriverId: "",
          assignedDriverName: "",
          assignedDriverPhone: "",
          assignedDriverEmail: "",

          acceptedByDriver:
            false,

          acceptedAt: null,

          status: "Approved",
          orderStatus: "Approved",

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}


/* ============================================
   UPDATE STATUS
============================================ */

export function updateDeliveryStatus(
  deliveryId,
  status
) {
  const deliveries =
    getDeliveries();

  const now =
    new Date().toISOString();

  const updated =
    deliveries.map(
      (delivery) => {
        if (
          delivery.id !==
          deliveryId
        ) {
          return delivery;
        }

        return {
          ...delivery,

          status,

          orderStatus:
            status,

          deliveredAt:
            status === "Delivered"
              ? now
              : delivery.deliveredAt,

          updatedAt: now,
        };
      }
    );

  saveDeliveries(
    updated
  );

  return updated;
}
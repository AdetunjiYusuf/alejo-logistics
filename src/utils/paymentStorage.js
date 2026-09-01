const ORDERS_KEY = "alejoOrders";

// ===============================
// GET ALL ORDERS
// ===============================

export function getOrders() {
  const saved = localStorage.getItem(ORDERS_KEY);

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

// ===============================
// SAVE ORDERS
// ===============================

export function saveOrders(orders) {
  localStorage.setItem(
    ORDERS_KEY,
    JSON.stringify(orders)
  );
}

// ===============================
// GET ONE ORDER
// ===============================

export function getOrderById(orderId) {
  const orders = getOrders();

  return orders.find(
    (order) => String(order.id) === String(orderId)
  );
}

// ===============================
// UPDATE ORDER
// ===============================

export function updateOrder(orderId, updates) {
  const orders = getOrders();

  const updatedOrders = orders.map((order) => {
    if (String(order.id) === String(orderId)) {
      return {
        ...order,
        ...updates,
      };
    }

    return order;
  });

  saveOrders(updatedOrders);

  return updatedOrders;
}

// ===============================
// CREATE ORDER
// ===============================

export function addOrder(order) {
  const orders = getOrders();

  const newOrder = {
    id: Date.now(),
    ...order,
    paymentStatus: order.paymentStatus || "unpaid",
    status: order.status || "pending",
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);

  saveOrders(orders);

  return newOrder;
}

// ===============================
// DELETE ORDER
// ===============================

export function deleteOrder(orderId) {
  const orders = getOrders();

  const filteredOrders = orders.filter(
    (order) =>
      String(order.id) !== String(orderId)
  );

  saveOrders(filteredOrders);

  return filteredOrders;
}
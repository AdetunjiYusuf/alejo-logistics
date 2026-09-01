const DRIVER_WALLET_KEY = "alejoDriverWallets";
const DRIVER_TRANSACTIONS_KEY = "alejoDriverTransactions";
const WITHDRAWAL_KEY = "alejoWithdrawals";


// ========================================
// DRIVER WALLETS
// ========================================

export function getDriverWallets() {
  const saved = localStorage.getItem(
    DRIVER_WALLET_KEY
  );

  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}


export function saveDriverWallets(wallets) {
  localStorage.setItem(
    DRIVER_WALLET_KEY,
    JSON.stringify(wallets)
  );
}


export function getDriverBalance(driverId) {
  const wallets = getDriverWallets();

  return Number(wallets[driverId] || 0);
}


// ========================================
// ADD DRIVER EARNINGS
// ========================================

export function addDriverEarnings(
  driverId,
  amount,
  description = "Delivery earnings"
) {
  const wallets = getDriverWallets();

  const value = Number(amount);

  if (!wallets[driverId]) {
    wallets[driverId] = 0;
  }

  wallets[driverId] += value;

  saveDriverWallets(wallets);

  addDriverTransaction(driverId, {
    type: "Credit",
    amount: value,
    description,
  });

  return wallets[driverId];
}


// ========================================
// WITHDRAW MONEY
// ========================================

export function withdrawDriverMoney(
  driverId,
  amount
) {
  const balance =
    getDriverBalance(driverId);

  const value = Number(amount);

  if (!value || value <= 0) {
    return {
      success: false,
      message: "Enter a valid amount.",
    };
  }

  if (value > balance) {
    return {
      success: false,
      message: "Insufficient earnings balance.",
    };
  }

  const wallets = getDriverWallets();

  wallets[driverId] =
    balance - value;

  saveDriverWallets(wallets);

  addDriverTransaction(driverId, {
    type: "Debit",
    amount: value,
    description: "Withdrawal request",
  });

  return {
    success: true,
    balance: wallets[driverId],
  };
}


// ========================================
// DRIVER TRANSACTIONS
// ========================================

function addDriverTransaction(
  driverId,
  transaction
) {
  const saved =
    localStorage.getItem(
      DRIVER_TRANSACTIONS_KEY
    );

  let transactions = {};

  try {
    transactions = saved
      ? JSON.parse(saved)
      : {};
  } catch {
    transactions = {};
  }

  if (!transactions[driverId]) {
    transactions[driverId] = [];
  }

  transactions[driverId].unshift({
    id: `D-TX-${Date.now()}`,
    ...transaction,
    createdAt:
      new Date().toISOString(),
  });

  localStorage.setItem(
    DRIVER_TRANSACTIONS_KEY,
    JSON.stringify(transactions)
  );
}


export function getDriverTransactions(
  driverId
) {
  const saved =
    localStorage.getItem(
      DRIVER_TRANSACTIONS_KEY
    );

  if (!saved) return [];

  try {
    const transactions =
      JSON.parse(saved);

    return transactions[driverId] || [];
  } catch {
    return [];
  }
}


// ========================================
// WITHDRAWAL REQUESTS
// ========================================

export function getWithdrawals() {
  const saved =
    localStorage.getItem(
      WITHDRAWAL_KEY
    );

  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}


export function createWithdrawal(
  driver,
  amount
) {
  const withdrawals =
    getWithdrawals();

  const withdrawal = {
    id: `WD-${Date.now()}`,

    driverId:
      driver.id,

    driverName:
      driver.fullName ||
      driver.name ||
      "Driver",

    amount:
      Number(amount),

    status:
      "Pending",

    createdAt:
      new Date().toISOString(),
  };

  withdrawals.unshift(withdrawal);

  localStorage.setItem(
    WITHDRAWAL_KEY,
    JSON.stringify(withdrawals)
  );

  return withdrawal;
}
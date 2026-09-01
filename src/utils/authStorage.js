const CUSTOMER_ACCOUNTS_KEY = "alejoCustomerAccounts";
const CURRENT_USER_KEY = "alejoCurrentUser";
const LEGACY_USER_KEY = "alejoUser";


// ========================================
// CUSTOMER ACCOUNTS
// ========================================

export function getCustomerAccounts() {
  const saved = localStorage.getItem(
    CUSTOMER_ACCOUNTS_KEY
  );

  if (!saved) {
    return [];
  }

  try {
    const accounts = JSON.parse(saved);

    return Array.isArray(accounts)
      ? accounts
      : [];
  } catch (error) {
    console.error(
      "Could not read customer accounts:",
      error
    );

    return [];
  }
}


// ========================================
// SAVE CUSTOMER ACCOUNTS
// ========================================

export function saveCustomerAccounts(accounts) {
  localStorage.setItem(
    CUSTOMER_ACCOUNTS_KEY,
    JSON.stringify(accounts)
  );
}


// ========================================
// FIND CUSTOMER
// ========================================

export function findCustomer(email, password) {
  const accounts = getCustomerAccounts();

  return accounts.find(
    (account) =>
      account.email?.toLowerCase() ===
        email.trim().toLowerCase() &&
      account.password === password
  );
}


// ========================================
// GET CURRENT USER
// ========================================

export function getCurrentUser() {
  let saved = localStorage.getItem(
    CURRENT_USER_KEY
  );

  /*
    FALLBACK:
    If the main session somehow isn't available,
    try the older alejoUser storage.
  */

  if (!saved) {
    saved = localStorage.getItem(
      LEGACY_USER_KEY
    );
  }

  if (!saved) {
    return null;
  }

  try {
    const user = JSON.parse(saved);

    if (!user || !user.id) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "Could not read current user:",
      error
    );

    return null;
  }
}


// ========================================
// SAVE CURRENT USER
// ========================================

export function saveCurrentUser(user) {
  if (!user) {
    return;
  }

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
  );

  /*
    Keep compatibility with older pages.
  */

  localStorage.setItem(
    LEGACY_USER_KEY,
    JSON.stringify(user)
  );
}


// ========================================
// CUSTOMER LOGIN CHECK
// ========================================

export function isCustomerLoggedIn() {
  const user = getCurrentUser();

  return !!(
    user &&
    user.id &&
    user.role === "customer"
  );
}


// ========================================
// LOGOUT
// ========================================

export function logoutUser() {
  localStorage.removeItem(
    CURRENT_USER_KEY
  );

  localStorage.removeItem(
    LEGACY_USER_KEY
  );
}
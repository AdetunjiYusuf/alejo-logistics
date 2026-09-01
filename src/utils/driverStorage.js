const DRIVER_KEY = "alejoDrivers";

const DEFAULT_DRIVERS = [
  {
    id: "DRV-001",
    name: "Driver 1",
    email: "driver1@alejologistics.com",
    password: "AlejoDriver2026",
    role: "driver",
    active: true,
  },
  {
    id: "DRV-002",
    name: "Driver 2",
    email: "driver2@alejologistics.com",
    password: "AlejoDriver2026",
    role: "driver",
    active: true,
  },
];

export function getDrivers() {
  const saved = localStorage.getItem(DRIVER_KEY);

  if (!saved) {
    localStorage.setItem(
      DRIVER_KEY,
      JSON.stringify(DEFAULT_DRIVERS)
    );

    return DEFAULT_DRIVERS;
  }

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(
      DRIVER_KEY,
      JSON.stringify(DEFAULT_DRIVERS)
    );

    return DEFAULT_DRIVERS;
  }
}

export function saveDrivers(drivers) {
  localStorage.setItem(
    DRIVER_KEY,
    JSON.stringify(drivers)
  );
}

export function getDriverByEmail(email) {
  return getDrivers().find(
    (driver) =>
      driver.email.toLowerCase() ===
      email.toLowerCase() &&
      driver.active
  );
}
const BASE_FEE = 1000;
const PRICE_PER_KM = 300;
const MINIMUM_FEE = 1500;

export function calculateDeliveryPrice(distanceKm) {
  if (!distanceKm || distanceKm <= 0) {
    return 0;
  }

  const price = BASE_FEE + distanceKm * PRICE_PER_KM;

  return Math.max(Math.round(price / 100) * 100, MINIMUM_FEE);
}

export function getPricingSettings() {
  return {
    baseFee: BASE_FEE,
    pricePerKm: PRICE_PER_KM,
    minimumFee: MINIMUM_FEE,
  };
}[]
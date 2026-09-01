const PRICING_KEY =
  "alejoPricing";

const DEFAULT_PRICING = {
  baseFee: 1000,
  pricePerKm: 200,
};

export function getPricing() {
  try {
    const saved =
      localStorage.getItem(
        PRICING_KEY
      );

    if (!saved) {
      return DEFAULT_PRICING;
    }

    const parsed =
      JSON.parse(saved);

    return {
      baseFee:
        Number(parsed.baseFee) ||
        DEFAULT_PRICING.baseFee,

      pricePerKm:
        Number(parsed.pricePerKm) ||
        DEFAULT_PRICING.pricePerKm,
    };
  } catch (error) {
    console.error(
      "Could not read pricing:",
      error
    );

    return DEFAULT_PRICING;
  }
}

export function savePricing(pricing) {
  const cleanPricing = {
    baseFee:
      Number(pricing.baseFee) || 0,

    pricePerKm:
      Number(pricing.pricePerKm) || 0,
  };

  localStorage.setItem(
    PRICING_KEY,
    JSON.stringify(cleanPricing)
  );

  return cleanPricing;
}

export function calculateDeliveryPrice(
  distanceKm,
  pricing = getPricing()
) {
  const distance =
    Number(distanceKm) || 0;

  const baseFee =
    Number(pricing.baseFee) || 0;

  const pricePerKm =
    Number(pricing.pricePerKm) || 0;

  return Math.round(
    baseFee +
      distance * pricePerKm
  );
}
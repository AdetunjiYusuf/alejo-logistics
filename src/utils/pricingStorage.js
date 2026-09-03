const PRICING_KEY = "alejoPricing";

const DEFAULT_PRICING = {
  baseFee: 1000,
  pricePerKm: 200,
};

export function getPricing() {
  try {
    const saved = localStorage.getItem(
      PRICING_KEY
    );

    if (!saved) {
      return {
        ...DEFAULT_PRICING,
      };
    }

    const parsed = JSON.parse(saved);

    return {
      baseFee:
        Number(parsed.baseFee) >= 0
          ? Number(parsed.baseFee)
          : DEFAULT_PRICING.baseFee,

      pricePerKm:
        Number(parsed.pricePerKm) >= 0
          ? Number(parsed.pricePerKm)
          : DEFAULT_PRICING.pricePerKm,
    };
  } catch {
    return {
      ...DEFAULT_PRICING,
    };
  }
}

export function savePricing(pricing) {
  const cleanPricing = {
    baseFee:
      Math.max(0, Number(pricing.baseFee) || 0),

    pricePerKm:
      Math.max(
        0,
        Number(pricing.pricePerKm) || 0
      ),
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
    Math.max(
      0,
      Number(distanceKm) || 0
    );

  const baseFee =
    Math.max(
      0,
      Number(pricing.baseFee) || 0
    );

  const pricePerKm =
    Math.max(
      0,
      Number(pricing.pricePerKm) || 0
    );

  return Math.round(
    baseFee +
      distance * pricePerKm
  );
}

export function getExamplePrice() {
  const pricing = getPricing();

  return calculateDeliveryPrice(
    10,
    pricing
  );
}

export function resetPricing() {
  return savePricing(
    DEFAULT_PRICING
  );
}
import { blackScholesPrice } from "./blackScholes";
import { PayoffInput, PayoffDataPoint } from "./types";

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

function determineStep(price: number): number {
  if (price < 50) return 1;
  if (price < 200) return 2.5;
  if (price < 500) return 5;
  return 10;
}

export interface TimePeriod {
  key: string;
  label: string;
  daysBeforeExpiry: number;
}

export function calculatePayoff(input: PayoffInput): {
  data: PayoffDataPoint[];
  timePeriods: TimePeriod[];
  breakeven: number | null;
} {
  const { contract, position, premium, quantity, currentPrice } = input;
  const multiplier = 100;
  const totalPremium = premium * quantity * multiplier;
  const r = 0.05;
  const sigma = contract.impliedVolatility;

  const daysToExpiration = daysBetween(new Date(), new Date(contract.expiration));

  const minPrice = Math.max(1, Math.floor(currentPrice * 0.7));
  const maxPrice = Math.ceil(currentPrice * 1.3);
  const step = determineStep(currentPrice);

  // Build time periods dynamically
  const timePeriods: TimePeriod[] = [
    { key: "atExpiration", label: "At Expiration", daysBeforeExpiry: 0 },
  ];
  for (const days of [30, 60, 90]) {
    if (days < daysToExpiration) {
      timePeriods.push({
        key: `days${days}`,
        label: `${days}d Before Exp`,
        daysBeforeExpiry: days,
      });
    }
  }

  const data: PayoffDataPoint[] = [];
  let breakeven: number | null = null;
  let prevPnl = 0;

  for (let S = minPrice; S <= maxPrice; S += step) {
    const point: PayoffDataPoint = { stockPrice: S };

    // At expiration
    const intrinsic =
      contract.type === "call"
        ? Math.max(S - contract.strike, 0)
        : Math.max(contract.strike - S, 0);

    if (position === "buy") {
      point.atExpiration = intrinsic * quantity * multiplier - totalPremium;
    } else {
      point.atExpiration = totalPremium - intrinsic * quantity * multiplier;
    }

    // Intermediate time periods
    for (const tp of timePeriods) {
      if (tp.daysBeforeExpiry === 0) continue;
      const T = tp.daysBeforeExpiry / 365;
      const theoreticalPrice = blackScholesPrice(S, contract.strike, T, r, sigma, contract.type);
      const positionValue = theoreticalPrice * quantity * multiplier;

      if (position === "buy") {
        point[tp.key] = positionValue - totalPremium;
      } else {
        point[tp.key] = totalPremium - positionValue;
      }
    }

    // Track breakeven (where atExpiration crosses zero)
    if (data.length > 0 && breakeven === null) {
      if ((prevPnl < 0 && point.atExpiration >= 0) || (prevPnl > 0 && point.atExpiration <= 0)) {
        breakeven = S;
      }
    }
    prevPnl = point.atExpiration;

    data.push(point);
  }

  return { data, timePeriods, breakeven };
}

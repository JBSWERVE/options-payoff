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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface TimePeriod {
  key: string;
  label: string;
  date: Date;
  month: string;
  daysBeforeExpiry: number;
}

function generateDateColumns(today: Date, expiration: Date): TimePeriod[] {
  const totalDays = daysBetween(today, expiration);
  if (totalDays <= 0) {
    return [{
      key: formatDateKey(today),
      label: String(today.getDate()),
      date: new Date(today),
      month: MONTH_NAMES[today.getMonth()],
      daysBeforeExpiry: 0,
    }];
  }

  let interval: number;
  if (totalDays <= 14) interval = 1;
  else if (totalDays <= 60) interval = Math.max(2, Math.ceil(totalDays / 25));
  else if (totalDays <= 180) interval = 7;
  else if (totalDays <= 365) interval = 14;
  else interval = 30;

  const columns: TimePeriod[] = [];
  const cursor = new Date(today);

  while (cursor <= expiration) {
    const d = new Date(cursor);
    const daysLeft = daysBetween(d, expiration);
    columns.push({
      key: formatDateKey(d),
      label: String(d.getDate()),
      date: d,
      month: MONTH_NAMES[d.getMonth()],
      daysBeforeExpiry: daysLeft,
    });
    cursor.setDate(cursor.getDate() + interval);
  }

  // Always include expiration as last column
  const lastKey = formatDateKey(expiration);
  if (columns.length === 0 || columns[columns.length - 1].key !== lastKey) {
    columns.push({
      key: lastKey,
      label: String(expiration.getDate()),
      date: new Date(expiration),
      month: MONTH_NAMES[expiration.getMonth()],
      daysBeforeExpiry: 0,
    });
  }

  return columns;
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiration = new Date(contract.expiration + "T00:00:00");

  const minPrice = input.priceRangeLow ?? Math.max(1, Math.floor(currentPrice * 0.7));
  const maxPrice = input.priceRangeHigh ?? Math.ceil(currentPrice * 1.3);
  const step = determineStep(currentPrice);

  const timePeriods = generateDateColumns(today, expiration);

  const data: PayoffDataPoint[] = [];
  let breakeven: number | null = null;
  let prevPnl = 0;

  for (let S = minPrice; S <= maxPrice; S += step) {
    const point: PayoffDataPoint = { stockPrice: S };

    for (const tp of timePeriods) {
      const T = tp.daysBeforeExpiry / 365;

      if (T <= 0) {
        // At expiration — intrinsic value
        const intrinsic =
          contract.type === "call"
            ? Math.max(S - contract.strike, 0)
            : Math.max(contract.strike - S, 0);
        point[tp.key] = position === "buy"
          ? intrinsic * quantity * multiplier - totalPremium
          : totalPremium - intrinsic * quantity * multiplier;
      } else {
        const theoreticalPrice = blackScholesPrice(S, contract.strike, T, r, sigma, contract.type);
        const positionValue = theoreticalPrice * quantity * multiplier;
        point[tp.key] = position === "buy"
          ? positionValue - totalPremium
          : totalPremium - positionValue;
      }
    }

    // Track breakeven using expiration column (last time period)
    const expirationKey = timePeriods[timePeriods.length - 1].key;
    const expirationPnl = point[expirationKey] || 0;
    if (data.length > 0 && breakeven === null) {
      if ((prevPnl < 0 && expirationPnl >= 0) || (prevPnl > 0 && expirationPnl <= 0)) {
        breakeven = S;
      }
    }
    prevPnl = expirationPnl;

    data.push(point);
  }

  // Reverse to descending order (high prices at top)
  data.reverse();

  return { data, timePeriods, breakeven };
}

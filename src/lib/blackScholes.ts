function cumulativeNormalDist(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const k = 1.0 / (1.0 + p * Math.abs(x));
  const y =
    1.0 -
    ((((a5 * k + a4) * k + a3) * k + a2) * k + a1) *
      k *
      Math.exp(-0.5 * x * x);

  return 0.5 * (1.0 + sign * y);
}

export function blackScholesPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): number {
  if (T <= 0) {
    const intrinsic =
      type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
    return intrinsic;
  }

  if (sigma <= 0.001) {
    const discountedK = K * Math.exp(-r * T);
    if (type === "call") return Math.max(S - discountedK, 0);
    return Math.max(discountedK - S, 0);
  }

  const sqrtT = Math.sqrt(T);
  const d1 =
    (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;

  if (type === "call") {
    return S * cumulativeNormalDist(d1) - K * Math.exp(-r * T) * cumulativeNormalDist(d2);
  }
  return K * Math.exp(-r * T) * cumulativeNormalDist(-d2) - S * cumulativeNormalDist(-d1);
}

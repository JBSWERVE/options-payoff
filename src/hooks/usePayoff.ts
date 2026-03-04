"use client";
import { useMemo } from "react";
import { PayoffInput, PayoffDataPoint } from "@/lib/types";
import { calculatePayoff, TimePeriod } from "@/lib/payoff";

export function usePayoff(input: PayoffInput | null): {
  data: PayoffDataPoint[];
  timePeriods: TimePeriod[];
  breakeven: number | null;
} {
  return useMemo(() => {
    if (!input) return { data: [], timePeriods: [], breakeven: null };
    return calculatePayoff(input);
  }, [input]);
}

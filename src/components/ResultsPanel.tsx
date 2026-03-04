"use client";
import { PayoffTable } from "./PayoffTable";
import { Card } from "./ui/Card";
import { PayoffDataPoint } from "@/lib/types";
import { TimePeriod } from "@/lib/payoff";

interface ResultsPanelProps {
  data: PayoffDataPoint[];
  timePeriods: TimePeriod[];
  breakeven: number | null;
  strike: number;
  maxProfit: number;
  maxLoss: number;
  currentPrice: number;
  totalPremium: number;
}

export function ResultsPanel({
  data,
  timePeriods,
  breakeven,
  strike,
  maxProfit,
  maxLoss,
  currentPrice,
  totalPremium,
}: ResultsPanelProps) {
  if (data.length === 0) return null;

  return (
    <Card>
      <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-4">
        Payoff Table
      </h3>
      <PayoffTable
        data={data}
        timePeriods={timePeriods}
        strike={strike}
        breakeven={breakeven}
        currentPrice={currentPrice}
        totalPremium={totalPremium}
        maxProfit={maxProfit}
        maxLoss={maxLoss}
      />
    </Card>
  );
}

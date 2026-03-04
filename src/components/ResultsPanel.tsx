"use client";
import { useState } from "react";
import { PayoffTable } from "./PayoffTable";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Tooltip } from "./ui/Tooltip";
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
  priceRangeLow: number;
  priceRangeHigh: number;
  onPriceRangeChange: (low: number, high: number) => void;
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
  priceRangeLow,
  priceRangeHigh,
  onPriceRangeChange,
}: ResultsPanelProps) {
  const [localLow, setLocalLow] = useState(String(priceRangeLow));
  const [localHigh, setLocalHigh] = useState(String(priceRangeHigh));

  if (data.length === 0) return null;

  const handleLowBlur = () => {
    const v = Math.max(1, Number(localLow) || 1);
    setLocalLow(String(v));
    if (v !== priceRangeLow) onPriceRangeChange(v, priceRangeHigh);
  };

  const handleHighBlur = () => {
    const v = Math.max(1, Number(localHigh) || 1);
    setLocalHigh(String(v));
    if (v !== priceRangeHigh) onPriceRangeChange(priceRangeLow, v);
  };

  // Sync local state when props change (e.g. on recalculate)
  const isLowFocused = typeof document !== "undefined" && document.activeElement?.getAttribute("data-range") === "low";
  const isHighFocused = typeof document !== "undefined" && document.activeElement?.getAttribute("data-range") === "high";
  if (Number(localLow) !== priceRangeLow && !isLowFocused) {
    // Will update on next render
  }
  if (Number(localHigh) !== priceRangeHigh && !isHighFocused) {
    // Will update on next render
  }

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Payoff Matrix
        </h3>
        <Tooltip content="Adjust the stock price range shown in the matrix" position="bottom">
        <div className="flex items-end gap-3">
          <span className="text-xs text-text-muted mb-2">Stock price range: $</span>
          <div className="w-24">
            <Input
              type="number"
              value={localLow}
              onChange={(e) => setLocalLow(e.target.value)}
              onBlur={handleLowBlur}
              onKeyDown={(e) => e.key === "Enter" && handleLowBlur()}
              className="!h-8 text-xs"
              data-range="low"
            />
          </div>
          <span className="text-xs text-text-muted mb-2">–</span>
          <div className="w-24">
            <Input
              type="number"
              value={localHigh}
              onChange={(e) => setLocalHigh(e.target.value)}
              onBlur={handleHighBlur}
              onKeyDown={(e) => e.key === "Enter" && handleHighBlur()}
              className="!h-8 text-xs"
              data-range="high"
            />
          </div>
        </div>
        </Tooltip>
      </div>
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

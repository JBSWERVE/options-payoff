"use client";
import { PayoffDataPoint } from "@/lib/types";
import { TimePeriod } from "@/lib/payoff";
import { formatCurrency } from "@/lib/formatting";

interface PayoffTableProps {
  data: PayoffDataPoint[];
  timePeriods: TimePeriod[];
  strike: number;
  breakeven: number | null;
  currentPrice: number;
  totalPremium: number;
  maxProfit: number;
  maxLoss: number;
}

function PnlCell({ value }: { value: number }) {
  const color =
    value > 0 ? "text-profit" : value < 0 ? "text-loss" : "text-text-muted";
  return (
    <td className={`px-3 py-2.5 text-right font-mono text-xs tabular-nums ${color}`}>
      {formatCurrency(value)}
    </td>
  );
}

function ReturnCell({ value, totalPremium }: { value: number; totalPremium: number }) {
  if (totalPremium === 0) {
    return <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums text-text-muted">—</td>;
  }
  const pct = (value / Math.abs(totalPremium)) * 100;
  const color = pct > 0 ? "text-profit" : pct < 0 ? "text-loss" : "text-text-muted";
  const sign = pct >= 0 ? "+" : "";
  return (
    <td className={`px-3 py-2.5 text-right font-mono text-xs tabular-nums ${color}`}>
      {sign}{pct.toFixed(1)}%
    </td>
  );
}

function isNearValue(price: number, target: number | null, data: PayoffDataPoint[]): boolean {
  if (target === null || data.length < 2) return false;
  const step = data.length > 1 ? Math.abs(data[1].stockPrice - data[0].stockPrice) : 1;
  return Math.abs(price - target) < step / 2;
}

export function PayoffTable({
  data,
  timePeriods,
  strike,
  breakeven,
  currentPrice,
  totalPremium,
  maxProfit,
  maxLoss,
}: PayoffTableProps) {
  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs">
        <div>
          <span className="text-text-secondary">Max Profit </span>
          <span className="font-mono font-semibold text-profit">
            {maxProfit === Infinity ? "Unlimited" : formatCurrency(maxProfit)}
          </span>
        </div>
        <div>
          <span className="text-text-secondary">Max Loss </span>
          <span className="font-mono font-semibold text-loss">{formatCurrency(maxLoss)}</span>
        </div>
        {breakeven !== null && (
          <div>
            <span className="text-text-secondary">Breakeven </span>
            <span className="font-mono font-semibold text-breakeven">{formatCurrency(breakeven)}</span>
          </div>
        )}
        <div>
          <span className="text-text-secondary">Strike </span>
          <span className="font-mono font-semibold text-text-primary">{formatCurrency(strike)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[520px] rounded-lg border border-border-custom">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-surface-elevated z-10">
            <tr className="border-b border-border-custom">
              <th className="px-3 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider w-10">
                {/* marker column */}
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Stock Price
              </th>
              {timePeriods.map((tp) => (
                <th
                  key={tp.key}
                  className="px-3 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider"
                >
                  {tp.label}
                </th>
              ))}
              <th className="px-3 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                % Return
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const isStrike = isNearValue(row.stockPrice, strike, data);
              const isBreakeven = isNearValue(row.stockPrice, breakeven, data);
              const isCurrent = isNearValue(row.stockPrice, currentPrice, data);

              const isLandmark = isStrike || isBreakeven || isCurrent;
              const borderColor = isBreakeven
                ? "border-l-breakeven"
                : isStrike
                ? "border-l-accent"
                : isCurrent
                ? "border-l-text-secondary"
                : "";

              return (
                <tr
                  key={row.stockPrice}
                  className={`border-b border-border-custom/50 ${
                    isLandmark ? `border-l-2 ${borderColor}` : "border-l-2 border-l-transparent"
                  } ${
                    i % 2 === 0 ? "bg-surface" : "bg-surface-elevated/30"
                  } hover:bg-surface-elevated/60 transition-colors`}
                >
                  <td className="px-3 py-2.5 text-xs text-text-muted whitespace-nowrap">
                    {isCurrent && "Current"}
                    {isStrike && !isCurrent && "Strike"}
                    {isBreakeven && !isStrike && !isCurrent && "B/E"}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs tabular-nums text-text-primary">
                    ${row.stockPrice.toFixed(2)}
                  </td>
                  {timePeriods.map((tp) => (
                    <PnlCell key={tp.key} value={row[tp.key] || 0} />
                  ))}
                  <ReturnCell value={row.atExpiration || 0} totalPremium={totalPremium} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

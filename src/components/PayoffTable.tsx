"use client";
import { useMemo } from "react";
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

function formatCompactPnl(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000) return `${sign}${(abs / 1000).toFixed(0)}k`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}k`;
  return `${sign}${abs.toFixed(0)}`;
}

function pnlToColor(value: number, maxProfit: number, maxLoss: number): string {
  if (value === 0) return "transparent";
  if (value > 0) {
    const intensity = Math.min(value / Math.max(maxProfit, 1), 1);
    return `rgba(0, 212, 170, ${(intensity * 0.55).toFixed(3)})`;
  }
  const intensity = Math.min(Math.abs(value) / Math.max(Math.abs(maxLoss), 1), 1);
  return `rgba(255, 68, 102, ${(intensity * 0.55).toFixed(3)})`;
}

function isNearValue(price: number, target: number | null, step: number): boolean {
  if (target === null) return false;
  return Math.abs(price - target) < step / 2;
}

interface MonthGroup {
  month: string;
  span: number;
}

function getMonthGroups(timePeriods: TimePeriod[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const tp of timePeriods) {
    const last = groups[groups.length - 1];
    if (last && last.month === tp.month) {
      last.span++;
    } else {
      groups.push({ month: tp.month, span: 1 });
    }
  }
  return groups;
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
  // Compute global max/min across ALL cells for color normalization
  const { globalMax, globalMin } = useMemo(() => {
    let max = 0;
    let min = 0;
    for (const row of data) {
      for (const tp of timePeriods) {
        const v = row[tp.key] || 0;
        if (v > max) max = v;
        if (v < min) min = v;
      }
    }
    return { globalMax: max, globalMin: min };
  }, [data, timePeriods]);

  const monthGroups = useMemo(() => getMonthGroups(timePeriods), [timePeriods]);
  const step = data.length > 1 ? Math.abs(data[0].stockPrice - data[1].stockPrice) : 1;
  const expirationKey = timePeriods[timePeriods.length - 1]?.key;

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

      {/* Heatmap */}
      <div className="overflow-auto max-h-[600px] rounded-lg border border-border-custom">
        <table className="border-collapse text-[10px] font-mono">
          <thead className="sticky top-0 z-20">
            {/* Month row */}
            <tr className="bg-surface-elevated">
              <th
                className="sticky left-0 z-30 bg-surface-elevated px-2 py-1.5 text-left text-[11px] font-medium text-text-secondary border-b border-r border-border-custom"
                rowSpan={2}
              >
                Stock
              </th>
              {monthGroups.map((g, i) => (
                <th
                  key={`${g.month}-${i}`}
                  colSpan={g.span}
                  className="px-1 py-1 text-center text-[11px] font-medium text-text-secondary border-b border-border-custom/50"
                >
                  {g.month}
                </th>
              ))}
              <th
                className="px-2 py-1 text-center text-[11px] font-medium text-text-secondary border-b border-l border-border-custom"
                rowSpan={2}
              >
                +/-%
              </th>
            </tr>
            {/* Day row */}
            <tr className="bg-surface-elevated">
              {timePeriods.map((tp) => (
                <th
                  key={tp.key}
                  className="px-1 py-1 text-center text-text-muted font-normal border-b border-border-custom/50 min-w-[32px]"
                >
                  {tp.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isStrike = isNearValue(row.stockPrice, strike, step);
              const isBreakeven = isNearValue(row.stockPrice, breakeven, step);
              const isCurrent = isNearValue(row.stockPrice, currentPrice, step);

              const borderClass = isBreakeven
                ? "border-l-2 border-l-breakeven"
                : isStrike
                ? "border-l-2 border-l-accent"
                : isCurrent
                ? "border-l-2 border-l-text-secondary"
                : "";

              const expirationPnl = row[expirationKey] || 0;
              const pctReturn = totalPremium !== 0
                ? (expirationPnl / Math.abs(totalPremium)) * 100
                : 0;
              const pctColor = pctReturn > 0 ? "text-profit" : pctReturn < 0 ? "text-loss" : "text-text-muted";

              return (
                <tr key={row.stockPrice} className={`${borderClass} hover:brightness-125 transition-all`}>
                  {/* Stock price - sticky left */}
                  <td className="sticky left-0 z-10 bg-surface px-2 py-1 text-[11px] tabular-nums text-text-primary border-r border-border-custom whitespace-nowrap font-medium">
                    <span className="inline-flex items-center gap-1">
                      {isCurrent && <span className="text-text-secondary text-[9px]">&#9654;</span>}
                      ${row.stockPrice.toFixed(2)}
                    </span>
                  </td>
                  {/* P&L cells */}
                  {timePeriods.map((tp) => {
                    const value = row[tp.key] || 0;
                    const bg = pnlToColor(value, globalMax, globalMin);
                    const textColor = Math.abs(value) < 1 ? "text-text-muted" : "text-text-primary";
                    return (
                      <td
                        key={tp.key}
                        className={`px-1 py-1 text-center tabular-nums ${textColor} border-border-custom/20`}
                        style={{ backgroundColor: bg }}
                      >
                        {formatCompactPnl(value)}
                      </td>
                    );
                  })}
                  {/* % return */}
                  <td className={`px-2 py-1 text-right tabular-nums border-l border-border-custom ${pctColor}`}>
                    {pctReturn >= 0 ? "+" : ""}{pctReturn.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

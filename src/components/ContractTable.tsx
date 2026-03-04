"use client";
import { useState } from "react";
import { OptionContract } from "@/lib/types";
import { formatStrike } from "@/lib/formatting";

interface ContractTableProps {
  calls: OptionContract[];
  puts: OptionContract[];
  selectedContract: OptionContract | null;
  onSelect: (contract: OptionContract) => void;
  disabled?: boolean;
}

function formatVol(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function ContractTable({
  calls,
  puts,
  selectedContract,
  onSelect,
  disabled = false,
}: ContractTableProps) {
  const [tab, setTab] = useState<"calls" | "puts">("calls");
  const contracts = tab === "calls" ? calls : puts;
  const sorted = [...contracts].sort((a, b) => a.strike - b.strike);

  if (calls.length === 0 && puts.length === 0) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Contract
        </span>
        <div className="h-10 flex items-center text-sm text-text-muted">
          Select an expiration first
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
        Contract
      </span>

      {/* Tabs */}
      <div className="flex gap-0 border border-border-custom rounded-md overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => setTab("calls")}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            tab === "calls"
              ? "bg-accent text-white"
              : "bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          Calls ({calls.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("puts")}
          className={`px-4 py-1.5 text-xs font-medium transition-colors border-l border-border-custom ${
            tab === "puts"
              ? "bg-accent text-white"
              : "bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          Puts ({puts.length})
        </button>
      </div>

      {/* Table */}
      <div className="max-h-64 overflow-auto border border-border-custom rounded-md bg-surface">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface-elevated">
            <tr className="text-text-muted uppercase tracking-wider">
              <th className="text-left px-2.5 py-2 font-medium">Strike</th>
              <th className="text-right px-2.5 py-2 font-medium">Last</th>
              <th className="text-right px-2.5 py-2 font-medium">Bid</th>
              <th className="text-right px-2.5 py-2 font-medium">Ask</th>
              <th className="text-right px-2.5 py-2 font-medium">Vol</th>
              <th className="text-right px-2.5 py-2 font-medium">OI</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const isSelected = selectedContract?.contractSymbol === c.contractSymbol;
              return (
                <tr
                  key={c.contractSymbol}
                  onClick={() => !disabled && onSelect(c)}
                  className={`border-t border-border-custom cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-accent/15 text-accent"
                      : "text-text-primary hover:bg-surface-elevated"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <td className="px-2.5 py-1.5 font-medium">{formatStrike(c.strike)}</td>
                  <td className="text-right px-2.5 py-1.5">${c.lastPrice.toFixed(2)}</td>
                  <td className="text-right px-2.5 py-1.5">${c.bid.toFixed(2)}</td>
                  <td className="text-right px-2.5 py-1.5">${c.ask.toFixed(2)}</td>
                  <td className="text-right px-2.5 py-1.5">{formatVol(c.volume)}</td>
                  <td className="text-right px-2.5 py-1.5">{formatVol(c.openInterest)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { Input } from "./ui/Input";
import { Tooltip } from "./ui/Tooltip";
import { formatCurrency } from "@/lib/formatting";

interface PriceOverrideProps {
  value: number;
  onChange: (value: number) => void;
  quantity: number;
}

export function PriceOverride({ value, onChange, quantity }: PriceOverrideProps) {
  return (
    <div className="flex items-end gap-3">
      <Tooltip content="Price per share you pay or receive for the option" position="bottom">
        <div className="w-36">
          <Input
            label="Premium (per share)"
            type="number"
            step="0.01"
            min="0"
            value={value || ""}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="font-mono"
          />
        </div>
      </Tooltip>
      <div className="h-10 flex items-center">
        <span className="text-text-muted text-xs">
          Total: {formatCurrency(value * quantity * 100)}
        </span>
      </div>
    </div>
  );
}

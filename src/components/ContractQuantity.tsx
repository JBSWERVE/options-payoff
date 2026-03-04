"use client";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";

interface ContractQuantityProps {
  value: number;
  onChange: (value: number) => void;
  onCalculate: () => void;
  disabled: boolean;
}

export function ContractQuantity({ value, onChange, onCalculate, disabled }: ContractQuantityProps) {
  return (
    <div className="flex items-end gap-4">
      <Tooltip content="Each contract represents 100 shares" position="bottom">
        <div className="w-28">
          <Input
            label="Contracts"
            type="number"
            min="1"
            step="1"
            value={value}
            onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="font-mono"
          />
        </div>
      </Tooltip>
      <div className="flex items-center gap-2">
        <Button onClick={onCalculate} disabled={disabled}>
          Calculate Payoff
        </Button>
        <kbd className="hidden sm:inline-block whitespace-nowrap">{typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "\u2318" : "Ctrl"}+\u23CE</kbd>
      </div>
    </div>
  );
}

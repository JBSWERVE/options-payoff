"use client";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

interface ContractQuantityProps {
  value: number;
  onChange: (value: number) => void;
  onCalculate: () => void;
  disabled: boolean;
}

export function ContractQuantity({ value, onChange, onCalculate, disabled }: ContractQuantityProps) {
  return (
    <div className="flex items-end gap-4">
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
      <Button onClick={onCalculate} disabled={disabled}>
        Calculate Payoff
      </Button>
    </div>
  );
}

"use client";
import { Dropdown } from "./ui/Dropdown";
import { PositionType } from "@/lib/types";

const positionOptions = [
  { value: "buy", label: "Buy (Long)" },
  { value: "write", label: "Write (Short)" },
];

interface PositionSelectorProps {
  value: PositionType;
  onChange: (value: PositionType) => void;
}

export function PositionSelector({ value, onChange }: PositionSelectorProps) {
  return (
    <Dropdown
      label="Position"
      value={value}
      options={positionOptions}
      onChange={(v) => onChange(v as PositionType)}
    />
  );
}

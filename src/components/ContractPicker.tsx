"use client";
import { Dropdown } from "./ui/Dropdown";
import { ContractTable } from "./ContractTable";
import { Spinner } from "./ui/Spinner";
import { OptionContract, OptionsChainData } from "@/lib/types";
import { formatDate } from "@/lib/formatting";

interface ContractPickerProps {
  optionsData: OptionsChainData | null;
  isLoading: boolean;
  selectedExpiration: string;
  onExpirationChange: (date: string) => void;
  selectedContract: OptionContract | null;
  onContractChange: (contract: OptionContract | null) => void;
}

export function ContractPicker({
  optionsData,
  isLoading,
  selectedExpiration,
  onExpirationChange,
  selectedContract,
  onContractChange,
}: ContractPickerProps) {
  const expirationOptions = [
    { value: "", label: "Select expiration" },
    ...(optionsData?.expirationDates.map((d) => ({
      value: d,
      label: formatDate(d),
    })) || []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="w-48">
        <Dropdown
          label="Expiration"
          value={selectedExpiration}
          options={expirationOptions}
          onChange={onExpirationChange}
          disabled={!optionsData}
          placeholder="Select expiration"
        />
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 h-10">
          <Spinner />
          <span className="text-text-muted text-xs">Loading contracts...</span>
        </div>
      ) : (
        <ContractTable
          calls={optionsData?.calls || []}
          puts={optionsData?.puts || []}
          selectedContract={selectedContract}
          onSelect={onContractChange}
          disabled={!selectedExpiration}
        />
      )}
    </div>
  );
}

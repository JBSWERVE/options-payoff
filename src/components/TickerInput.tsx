"use client";
import { Input } from "./ui/Input";
import { Spinner } from "./ui/Spinner";
import { QuoteData } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/formatting";

interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  quote: QuoteData | null;
  isLoading: boolean;
  error: string | null;
}

export function TickerInput({ value, onChange, quote, isLoading, error }: TickerInputProps) {
  return (
    <div className="flex items-end gap-4">
      <div className="w-40">
        <Input
          label="Ticker"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="AAPL"
          className="font-mono text-base tracking-wider"
        />
      </div>
      <div className="flex items-center gap-3 h-10">
        {isLoading && <Spinner />}
        {error && <span className="text-loss text-xs">{error}</span>}
        {quote && !isLoading && (
          <div className="flex items-baseline gap-3">
            <span className="text-text-secondary text-xs">{quote.shortName}</span>
            <span className="font-mono text-lg font-semibold text-text-primary">
              {formatCurrency(quote.regularMarketPrice)}
            </span>
            <span
              className={`font-mono text-sm ${
                quote.regularMarketChange >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {quote.regularMarketChange >= 0 ? "+" : ""}
              {quote.regularMarketChange.toFixed(2)} ({formatPercent(quote.regularMarketChangePercent)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

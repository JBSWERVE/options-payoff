"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { TickerInput } from "@/components/TickerInput";
import { PositionSelector } from "@/components/PositionSelector";
import { ContractPicker } from "@/components/ContractPicker";
import { PriceOverride } from "@/components/PriceOverride";
import { ContractQuantity } from "@/components/ContractQuantity";
import { ResultsPanel } from "@/components/ResultsPanel";
import { useQuote } from "@/hooks/useQuote";
import { useOptions } from "@/hooks/useOptions";
import { usePayoff } from "@/hooks/usePayoff";
import { OptionContract, PositionType, PayoffInput } from "@/lib/types";

export default function Home() {
  const [symbol, setSymbol] = useState("");
  const [position, setPosition] = useState<PositionType>("buy");
  const [selectedExpiration, setSelectedExpiration] = useState("");
  const [selectedContract, setSelectedContract] = useState<OptionContract | null>(null);
  const [pricePerContract, setPricePerContract] = useState(0);
  const [numContracts, setNumContracts] = useState(1);
  const [payoffInput, setPayoffInput] = useState<PayoffInput | null>(null);
  const [priceRangeLow, setPriceRangeLow] = useState(0);
  const [priceRangeHigh, setPriceRangeHigh] = useState(0);

  const { data: quote, isLoading: quoteLoading, error: quoteError } = useQuote(symbol);

  // Fetch initial options (no date) to get expiration list
  const { data: initialOptions } = useOptions(quote ? symbol : "");

  // Fetch specific expiration's chain
  const { data: expirationOptions, isLoading: optionsLoading } = useOptions(
    selectedExpiration ? symbol : "",
    selectedExpiration || undefined
  );

  // Use expiration-specific data if available, otherwise initial
  const optionsData = useMemo(() => {
    if (selectedExpiration && expirationOptions) return expirationOptions;
    if (initialOptions) return { ...initialOptions };
    return null;
  }, [initialOptions, expirationOptions, selectedExpiration]);

  const handleSymbolChange = useCallback((val: string) => {
    setSymbol(val);
    setSelectedExpiration("");
    setSelectedContract(null);
    setPricePerContract(0);
    setPayoffInput(null);
    setPriceRangeLow(0);
    setPriceRangeHigh(0);
  }, []);

  const handlePositionChange = useCallback((val: PositionType) => {
    setPosition(val);
    setPayoffInput(null);
  }, []);

  const handleExpirationChange = useCallback((date: string) => {
    setSelectedExpiration(date);
    setSelectedContract(null);
    setPricePerContract(0);
    setPayoffInput(null);
  }, []);

  const handleContractChange = useCallback((contract: OptionContract | null) => {
    setSelectedContract(contract);
    setPricePerContract(contract?.lastPrice || 0);
    setPayoffInput(null);
    setPriceRangeLow(0);
    setPriceRangeHigh(0);
  }, []);

  const handleCalculate = useCallback(() => {
    if (!selectedContract || !quote) return;
    const defaultLow = Math.max(1, Math.floor(quote.regularMarketPrice * 0.7));
    const defaultHigh = Math.ceil(quote.regularMarketPrice * 1.3);
    const low = priceRangeLow || defaultLow;
    const high = priceRangeHigh || defaultHigh;
    if (!priceRangeLow) setPriceRangeLow(low);
    if (!priceRangeHigh) setPriceRangeHigh(high);
    setPayoffInput({
      contract: selectedContract,
      position,
      premium: pricePerContract,
      quantity: numContracts,
      currentPrice: quote.regularMarketPrice,
      priceRangeLow: low,
      priceRangeHigh: high,
    });
  }, [selectedContract, quote, position, pricePerContract, numContracts, priceRangeLow, priceRangeHigh]);

  // Auto-recalculate when price range changes (only if already calculated)
  const handlePriceRangeChange = useCallback((low: number, high: number) => {
    setPriceRangeLow(low);
    setPriceRangeHigh(high);
  }, []);

  useEffect(() => {
    if (!payoffInput || !selectedContract || !quote) return;
    if (priceRangeLow > 0 && priceRangeHigh > 0) {
      setPayoffInput((prev) => {
        if (!prev) return prev;
        if (prev.priceRangeLow === priceRangeLow && prev.priceRangeHigh === priceRangeHigh) return prev;
        return { ...prev, priceRangeLow, priceRangeHigh };
      });
    }
  }, [priceRangeLow, priceRangeHigh, payoffInput, selectedContract, quote]);

  const { data: payoffData, timePeriods, breakeven } = usePayoff(payoffInput);

  const { maxProfit, maxLoss } = useMemo(() => {
    if (payoffData.length === 0 || timePeriods.length === 0) return { maxProfit: 0, maxLoss: 0 };
    // Use expiration column (last time period) for max profit/loss
    const expKey = timePeriods[timePeriods.length - 1].key;
    const expirationValues = payoffData.map((d) => d[expKey] || 0);
    return {
      maxProfit: Math.max(...expirationValues),
      maxLoss: Math.min(...expirationValues),
    };
  }, [payoffData, timePeriods]);

  const canCalculate = !!selectedContract && !!quote && pricePerContract > 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border-custom bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-text-primary">
              Options Payoff Calculator
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Analyze P&L across price scenarios and time horizons
            </p>
          </div>
          {quote && (
            <div className="text-right">
              <span className="font-mono text-xs text-text-secondary">{quote.symbol}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Input Section */}
        <Card>
          <div className="space-y-5">
            {/* Row 1: Ticker + Position */}
            <div className="flex flex-wrap items-end gap-6">
              <TickerInput
                value={symbol}
                onChange={handleSymbolChange}
                quote={quote}
                isLoading={quoteLoading}
                error={quoteError}
              />
              <PositionSelector value={position} onChange={handlePositionChange} />
            </div>

            {/* Row 2: Expiration + Contract */}
            {quote && (
              <ContractPicker
                optionsData={optionsData}
                isLoading={optionsLoading}
                selectedExpiration={selectedExpiration}
                onExpirationChange={handleExpirationChange}
                selectedContract={selectedContract}
                onContractChange={handleContractChange}
                currentPrice={quote.regularMarketPrice}
              />
            )}

            {/* Row 3: Price + Quantity + Calculate */}
            {selectedContract && (
              <div className="flex flex-wrap items-end gap-6">
                <PriceOverride
                  value={pricePerContract}
                  onChange={(v) => { setPricePerContract(v); setPayoffInput(null); }}
                  quantity={numContracts}
                />
                <ContractQuantity
                  value={numContracts}
                  onChange={(v) => { setNumContracts(v); setPayoffInput(null); }}
                  onCalculate={handleCalculate}
                  disabled={!canCalculate}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Empty State */}
        {!payoffInput && (
          <div className="text-center py-20">
            <div className="text-text-muted text-sm">
              {!quote
                ? "Enter a stock ticker to begin"
                : !selectedContract
                ? "Select an options contract"
                : "Configure your position and calculate"}
            </div>
          </div>
        )}

        {/* Results */}
        <ResultsPanel
          data={payoffData}
          timePeriods={timePeriods}
          breakeven={breakeven}
          strike={selectedContract?.strike || 0}
          maxProfit={maxProfit}
          maxLoss={maxLoss}
          currentPrice={quote?.regularMarketPrice || 0}
          totalPremium={pricePerContract * numContracts * 100}
          priceRangeLow={priceRangeLow}
          priceRangeHigh={priceRangeHigh}
          onPriceRangeChange={handlePriceRangeChange}
        />
      </div>
    </main>
  );
}

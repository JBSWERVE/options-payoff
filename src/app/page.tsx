"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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

const SUBTITLES = [
  "Analyze P&L across price scenarios and time horizons",
  "Visualize time decay with the heatmap matrix",
  "Find your breakeven and max profit instantly",
  "Compare strategies before you trade",
];

function AnimatedSubtitle() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % SUBTITLES.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className="text-xs text-text-muted mt-1 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {SUBTITLES[index]}
    </p>
  );
}

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
  const handleCalculateRef = useRef<() => void>(() => {});

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

  // Keep ref in sync for keyboard shortcut
  handleCalculateRef.current = handleCalculate;

  const canCalculate = !!selectedContract && !!quote && pricePerContract > 0;

  // Keyboard shortcut: Ctrl/Cmd+Enter to calculate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleCalculateRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
    const expKey = timePeriods[timePeriods.length - 1].key;
    const expirationValues = payoffData.map((d) => d[expKey] || 0);
    return {
      maxProfit: Math.max(...expirationValues),
      maxLoss: Math.min(...expirationValues),
    };
  }, [payoffData, timePeriods]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="hero-glow border-b border-border-custom">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-gradient text-xl font-bold tracking-tight">
              Options Payoff Calculator
            </h1>
            <AnimatedSubtitle />
          </div>
          <div className="flex items-center gap-4">
            {quote && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-text-primary">{quote.symbol}</span>
                <span className="font-mono text-xs text-text-secondary">
                  ${quote.regularMarketPrice.toFixed(2)}
                </span>
                <span
                  className={`font-mono text-xs ${
                    quote.regularMarketChange >= 0 ? "text-profit" : "text-loss"
                  }`}
                >
                  {quote.regularMarketChange >= 0 ? "+" : ""}
                  {quote.regularMarketChange.toFixed(2)} ({quote.regularMarketChangePercent.toFixed(2)}%)
                </span>
              </div>
            )}
            <kbd className="hidden sm:inline-block">/</kbd>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Input Section */}
        <Card className="animate-fade-in">
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
          <div className="text-center py-20 animate-fade-in-delay">
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
        <div className="animate-fade-in-delay">
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
      </div>
    </main>
  );
}

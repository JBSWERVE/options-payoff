"use client";
import { useState, useEffect } from "react";
import { QuoteData } from "@/lib/types";

export function useQuote(symbol: string) {
  const [data, setData] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol || symbol.length < 1) {
      setData(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to fetch quote");
        }
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [symbol]);

  return { data, isLoading, error };
}

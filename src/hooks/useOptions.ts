"use client";
import { useState, useEffect } from "react";
import { OptionsChainData } from "@/lib/types";

export function useOptions(symbol: string, date?: string) {
  const [data, setData] = useState<OptionsChainData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setData(null);
      return;
    }

    let cancelled = false;

    async function fetchOptions() {
      setIsLoading(true);
      setError(null);
      try {
        let url = `/api/options?symbol=${encodeURIComponent(symbol)}`;
        if (date) url += `&date=${encodeURIComponent(date)}`;
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to fetch options");
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setData(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchOptions();
    return () => { cancelled = true; };
  }, [symbol, date]);

  return { data, isLoading, error };
}

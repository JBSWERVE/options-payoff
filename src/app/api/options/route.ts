import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const date = searchParams.get("date");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const queryOptions: { date?: Date } = {};
    if (date) {
      queryOptions.date = new Date(date);
    }

    const result = await yahooFinance.options(symbol.toUpperCase(), queryOptions);

    const expirationDates = result.expirationDates.map((d) =>
      d.toISOString().split("T")[0]
    );

    const firstOption = result.options[0];
    const calls = (firstOption?.calls || []).map((c) => ({
      contractSymbol: c.contractSymbol,
      type: "call" as const,
      strike: c.strike,
      expiration: c.expiration.toISOString().split("T")[0],
      lastPrice: c.lastPrice || 0,
      bid: c.bid || 0,
      ask: c.ask || 0,
      impliedVolatility: c.impliedVolatility || 0.3,
      openInterest: c.openInterest || 0,
      volume: c.volume || 0,
    }));

    const puts = (firstOption?.puts || []).map((c) => ({
      contractSymbol: c.contractSymbol,
      type: "put" as const,
      strike: c.strike,
      expiration: c.expiration.toISOString().split("T")[0],
      lastPrice: c.lastPrice || 0,
      bid: c.bid || 0,
      ask: c.ask || 0,
      impliedVolatility: c.impliedVolatility || 0.3,
      openInterest: c.openInterest || 0,
      volume: c.volume || 0,
    }));

    return NextResponse.json({
      expirationDates,
      calls,
      puts,
      underlyingPrice: result.quote?.regularMarketPrice || 0,
    });
  } catch {
    return NextResponse.json(
      { error: `Could not fetch options for "${symbol}"` },
      { status: 500 }
    );
  }
}

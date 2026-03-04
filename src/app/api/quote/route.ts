import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  try {
    const quote = await yahooFinance.quote(symbol.toUpperCase());

    return NextResponse.json({
      symbol: quote.symbol,
      shortName: quote.shortName || quote.symbol,
      regularMarketPrice: quote.regularMarketPrice,
      regularMarketChange: quote.regularMarketChange,
      regularMarketChangePercent: quote.regularMarketChangePercent,
      currency: quote.currency || "USD",
    });
  } catch {
    return NextResponse.json(
      { error: `Could not find quote for "${symbol}"` },
      { status: 404 }
    );
  }
}

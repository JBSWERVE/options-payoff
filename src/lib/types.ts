export interface QuoteData {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  currency: string;
}

export interface OptionContract {
  contractSymbol: string;
  type: "call" | "put";
  strike: number;
  expiration: string;
  lastPrice: number;
  bid: number;
  ask: number;
  impliedVolatility: number;
  openInterest: number;
  volume: number;
}

export type PositionType = "buy" | "write";

export interface PayoffInput {
  contract: OptionContract;
  position: PositionType;
  premium: number;
  quantity: number;
  currentPrice: number;
}

export interface PayoffDataPoint {
  stockPrice: number;
  [key: string]: number;
}

export interface OptionsChainData {
  expirationDates: string[];
  calls: OptionContract[];
  puts: OptionContract[];
  underlyingPrice: number;
}

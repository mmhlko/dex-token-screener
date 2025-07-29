export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null;
  pair?: DexScreenerPair | null;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: TransactionStats;
    h1: TransactionStats;
    h6: TransactionStats;
    h24: TransactionStats;
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: {
      label?: string;
      url: string;
    }[];
    socials?: {
      type: string;
      url: string;
    }[];
  };
}

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface TransactionStats {
  buys: number;
  sells: number;
}

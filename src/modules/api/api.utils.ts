import { DexScreenerPair } from './dto/dexscreener.dto';
import { PairDto } from './dto/pair.dto';

export function transformToPairDto(pairs: DexScreenerPair[]): PairDto[] {
  return pairs.map((pair) => {
    const trades24h = pair.txns.h24.buys + pair.txns.h24.sells;
    const priceChange24h = pair.priceChange.h24 || 0;

    return {
      blockchain: pair.chainId,
      dex: pair.dexId,
      pairAddress: pair.pairAddress,
      baseToken: {
        address: pair.baseToken.address,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
      },
      quoteToken: {
        address: pair.quoteToken.address,
        name: pair.quoteToken.name,
        symbol: pair.quoteToken.symbol,
      },
      liquidity: pair.liquidity
        ? {
            usd: pair.liquidity.usd,
            base: pair.liquidity.base,
            quote: pair.liquidity.quote,
          }
        : {
            usd: 0,
            base: 0,
            quote: 0,
          },
      volume24h: pair.volume.h24,
      mcap: pair.marketCap,
      pairCreatedAt: pair.pairCreatedAt,
      trades24h,
      usdPrice: pair.priceUsd,
      priceInBaseToken: pair.priceNative,
      priceChangePercent24h: priceChange24h,
      logo: pair.info?.imageUrl || '',
      socials: pair.info?.socials || [],
    };
  });
}

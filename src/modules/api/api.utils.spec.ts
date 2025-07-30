import { transformToPairDto } from './api.utils';
import { DexScreenerPair } from './dto/dexscreener.dto';
import { PairDto } from './dto/pair.dto';

describe('transformToPairDto', () => {
  const mockDexScreenerPair: DexScreenerPair = {
    chainId: 'solana',
    dexId: 'raydium',
    url: 'https://raydium.io',
    pairAddress: '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd',
    baseToken: {
      address: 'So11111111111111111111111111111111111111112',
      name: 'Wrapped SOL',
      symbol: 'SOL',
    },
    quoteToken: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    priceNative: '1.0',
    priceUsd: '100.0',
    txns: {
      m5: { buys: 10, sells: 5 },
      h1: { buys: 100, sells: 50 },
      h6: { buys: 500, sells: 250 },
      h24: { buys: 1000, sells: 500 },
    },
    volume: {
      h24: 1000000,
      h6: 250000,
      h1: 50000,
      m5: 5000,
    },
    priceChange: {
      m5: 0.5,
      h1: 1.2,
      h6: 2.5,
      h24: 5.0,
    },
    liquidity: {
      usd: 500000,
      base: 5000,
      quote: 500000,
    },
    fdv: 10000000,
    marketCap: 5000000,
    pairCreatedAt: 1640995200000,
    info: {
      imageUrl: 'https://example.com/sol.png',
      socials: [{ type: 'twitter', url: 'https://twitter.com/solana' }],
    },
  };

  const expectedPairDto: PairDto = {
    blockchain: 'solana',
    dex: 'raydium',
    pairAddress: '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd',
    baseToken: {
      address: 'So11111111111111111111111111111111111111112',
      name: 'Wrapped SOL',
      symbol: 'SOL',
    },
    quoteToken: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC',
    },
    liquidity: {
      usd: 500000,
      base: 5000,
      quote: 500000,
    },
    volume24h: 1000000,
    mcap: 5000000,
    pairCreatedAt: 1640995200000,
    trades24h: 1500,
    usdPrice: '100.0',
    priceInBaseToken: '1.0',
    priceChangePercent24h: 5.0,
    logo: 'https://example.com/sol.png',
    socials: [{ type: 'twitter', url: 'https://twitter.com/solana' }],
  };

  it('should transform DexScreenerPair to PairDto correctly', () => {
    const result = transformToPairDto([mockDexScreenerPair]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedPairDto);
  });

  it('should handle empty array', () => {
    const result = transformToPairDto([]);

    expect(result).toEqual([]);
  });

  it('should handle pair without liquidity', () => {
    const pairWithoutLiquidity = {
      ...mockDexScreenerPair,
      liquidity: undefined,
    };

    const result = transformToPairDto([pairWithoutLiquidity]);

    expect(result[0].liquidity).toEqual({
      usd: 0,
      base: 0,
      quote: 0,
    });
  });

  it('should handle pair without price change', () => {
    const pairWithoutPriceChange = {
      ...mockDexScreenerPair,
      priceChange: {
        m5: 0.5,
        h1: 1.2,
        h6: 2.5,
        // h24 is missing
      },
    };

    const result = transformToPairDto([pairWithoutPriceChange]);

    expect(result[0].priceChangePercent24h).toBe(0);
  });

  it('should handle pair without info', () => {
    const pairWithoutInfo = {
      ...mockDexScreenerPair,
      info: undefined,
    };

    const result = transformToPairDto([pairWithoutInfo]);

    expect(result[0].logo).toBe('');
    expect(result[0].socials).toEqual([]);
  });

  it('should handle pair without socials', () => {
    const pairWithoutSocials = {
      ...mockDexScreenerPair,
      info: {
        imageUrl: 'https://example.com/sol.png',
        // socials is missing
      },
    };

    const result = transformToPairDto([pairWithoutSocials]);

    expect(result[0].socials).toEqual([]);
  });

  it('should calculate trades24h correctly', () => {
    const result = transformToPairDto([mockDexScreenerPair]);

    expect(result[0].trades24h).toBe(1500); // 1000 + 500
  });

  it('should transform multiple pairs', () => {
    const secondPair: DexScreenerPair = {
      ...mockDexScreenerPair,
      pairAddress: '9uF4Xh61rDwxnG9woyxsVQP7zuA6kLFpb3NvnRQeoiSb  ',
      chainId: 'ethereum',
      dexId: 'uniswap',
    };

    const result = transformToPairDto([mockDexScreenerPair, secondPair]);

    expect(result).toHaveLength(2);
    expect(result[0].blockchain).toBe('solana');
    expect(result[0].dex).toBe('raydium');
    expect(result[1].blockchain).toBe('ethereum');
    expect(result[1].dex).toBe('uniswap');
  });
});

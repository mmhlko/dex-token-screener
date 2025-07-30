import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { RedisService } from '../redis/redis.service';
import { DexScreenerResponse, DexScreenerPair } from './dto/dexscreener.dto';
import { PairDto } from './dto/pair.dto';

describe('ApiService', () => {
  let service: ApiService;

  const mockRedisService = {
    getPairsByQuery: jest.fn(),
    getPairData: jest.fn(),
    getPairsByToken: jest.fn(),
    savePairsData: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockPair: DexScreenerPair = {
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

  const mockTransformedPair: PairDto = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ApiService>(ApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchPairs', () => {
    it('should return cached pairs when available', async () => {
      const query = 'SOL/USDC';
      const cachedPairs = [mockTransformedPair];
      mockRedisService.getPairsByQuery.mockResolvedValue(cachedPairs);

      const result = await service.searchPairs(query);

      expect(result).toEqual(cachedPairs);
      expect(mockRedisService.getPairsByQuery).toHaveBeenCalledWith(query);
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should fetch and cache pairs when not in cache', async () => {
      const query = 'SOL/USDC';
      const mockResponse: DexScreenerResponse = {
        schemaVersion: '1.0.0',
        pairs: [mockPair],
      };

      mockRedisService.getPairsByQuery.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.searchPairs(query);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTransformedPair);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.dexscreener.com/latest/dex/search',
        { params: { q: query } },
      );
      expect(mockRedisService.savePairsData).toHaveBeenCalledWith({
        pairs: [mockTransformedPair],
        query,
      });
    });

    it('should handle API errors gracefully', async () => {
      const query = 'SOL/USDC';
      const error = new Error('API Error');

      mockRedisService.getPairsByQuery.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.searchPairs(query)).rejects.toThrow(error);
    });

    it('should handle empty response from API', async () => {
      const query = 'SOL/USDC';
      const mockResponse: DexScreenerResponse = {
        schemaVersion: '1.0',
        pairs: null,
      };

      mockRedisService.getPairsByQuery.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.searchPairs(query);

      expect(result).toEqual([]);
      expect(mockRedisService.savePairsData).not.toHaveBeenCalled();
    });
  });

  describe('getPairByAddress', () => {
    it('should return cached pair when available', async () => {
      const chainId = 'solana';
      const pairId = '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd';
      mockRedisService.getPairData.mockResolvedValue(mockTransformedPair);

      const result = await service.getPairByAddress(chainId, pairId);

      expect(result).toEqual([mockTransformedPair]);
      expect(mockRedisService.getPairData).toHaveBeenCalledWith(pairId);
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should fetch and cache pair when not in cache', async () => {
      const chainId = 'solana';
      const pairId = '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd';
      const mockResponse: DexScreenerResponse = {
        schemaVersion: '1.0',
        pairs: [mockPair],
      };

      mockRedisService.getPairData.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getPairByAddress(chainId, pairId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTransformedPair);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairId}`,
      );
      expect(mockRedisService.savePairsData).toHaveBeenCalledWith({
        pairs: [mockTransformedPair],
      });
    });

    it('should handle API errors gracefully', async () => {
      const chainId = 'solana';
      const pairId = '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd';
      const error = new Error('API Error');

      mockRedisService.getPairData.mockResolvedValue(null);
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(service.getPairByAddress(chainId, pairId)).rejects.toThrow(
        error,
      );
    });
  });

  describe('getPairsByToken', () => {
    it('should return cached pairs when available', async () => {
      const chainId = 'solana';
      const tokenAddress = 'So11111111111111111111111111111111111111112';
      const cachedPairs = [mockTransformedPair];
      mockRedisService.getPairsByToken.mockResolvedValue(cachedPairs);

      const result = await service.getPairsByToken(chainId, tokenAddress);

      expect(result).toEqual(cachedPairs);
      expect(mockRedisService.getPairsByToken).toHaveBeenCalledWith(
        tokenAddress,
      );
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should fetch and cache pairs when not in cache', async () => {
      const chainId = 'solana';
      const tokenAddress = 'So11111111111111111111111111111111111111112';

      mockRedisService.getPairsByToken.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(of({ data: [mockPair] }));

      const result = await service.getPairsByToken(chainId, tokenAddress);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTransformedPair);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://api.dexscreener.com/tokens/v1/${chainId}/${tokenAddress}`,
      );
      expect(mockRedisService.savePairsData).toHaveBeenCalledWith({
        pairs: [mockTransformedPair],
        tokenAddress,
      });
    });

    it('should handle API errors gracefully', async () => {
      const chainId = 'solana';
      const tokenAddress = 'So11111111111111111111111111111111111111112';
      const error = new Error('API Error');

      mockRedisService.getPairsByToken.mockResolvedValue([]);
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(
        service.getPairsByToken(chainId, tokenAddress),
      ).rejects.toThrow(error);
    });
  });
});

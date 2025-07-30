import { Test, TestingModule } from '@nestjs/testing';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { PairDto } from './dto/pair.dto';
import { BadRequestException } from '@nestjs/common';

describe('ApiController', () => {
  let controller: ApiController;

  const mockApiService = {
    searchPairs: jest.fn(),
    getPairByAddress: jest.fn(),
    getPairsByToken: jest.fn(),
  };

  const mockPair: PairDto = {
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
      controllers: [ApiController],
      providers: [
        {
          provide: ApiService,
          useValue: mockApiService,
        },
      ],
    }).compile();

    controller = module.get<ApiController>(ApiController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchPairs', () => {
    it('should return pairs from service', async () => {
      const query = 'SOL/USDC';
      const expectedPairs: PairDto[] = [mockPair];
      mockApiService.searchPairs.mockResolvedValue(expectedPairs);

      const result = await controller.searchPairs(query);

      expect(result).toEqual(expectedPairs);
      expect(mockApiService.searchPairs).toHaveBeenCalledWith(query);
    });

    it('should handle empty query', async () => {
      const query = '';
      await expect(controller.searchPairs(query)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle service errors', async () => {
      const query = 'SOL/USDC';
      const error = new Error('Service error');
      mockApiService.searchPairs.mockRejectedValue(error);

      await expect(controller.searchPairs(query)).rejects.toThrow(error);
      expect(mockApiService.searchPairs).toHaveBeenCalledWith(query);
    });
  });

  describe('getPairByAddress', () => {
    it('should return pair from service', async () => {
      const chainId = 'solana';
      const pairId = '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd';
      const expectedPairs: PairDto[] = [mockPair];
      mockApiService.getPairByAddress.mockResolvedValue(expectedPairs);

      const result = await controller.getPairByAddress(chainId, pairId);

      expect(result).toEqual(expectedPairs);
      expect(mockApiService.getPairByAddress).toHaveBeenCalledWith(
        chainId,
        pairId,
      );
    });

    it('should handle service errors', async () => {
      const chainId = 'solana';
      const pairId = '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd';
      const error = new Error('Service error');
      mockApiService.getPairByAddress.mockRejectedValue(error);

      await expect(
        controller.getPairByAddress(chainId, pairId),
      ).rejects.toThrow(error);
      expect(mockApiService.getPairByAddress).toHaveBeenCalledWith(
        chainId,
        pairId,
      );
    });
  });

  describe('getPairsByToken', () => {
    it('should return pairs from service', async () => {
      const chainId = 'solana';
      const tokenAddress = 'So11111111111111111111111111111111111111112';
      const expectedPairs: PairDto[] = [mockPair];
      mockApiService.getPairsByToken.mockResolvedValue(expectedPairs);

      const result = await controller.getPairsByToken(chainId, tokenAddress);

      expect(result).toEqual(expectedPairs);
      expect(mockApiService.getPairsByToken).toHaveBeenCalledWith(
        chainId,
        tokenAddress,
      );
    });

    it('should handle service errors', async () => {
      const chainId = 'solana';
      const tokenAddress = 'So11111111111111111111111111111111111111112';
      const error = new Error('Service error');
      mockApiService.getPairsByToken.mockRejectedValue(error);

      await expect(
        controller.getPairsByToken(chainId, tokenAddress),
      ).rejects.toThrow(error);
      expect(mockApiService.getPairsByToken).toHaveBeenCalledWith(
        chainId,
        tokenAddress,
      );
    });
  });
});

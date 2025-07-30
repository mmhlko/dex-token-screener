import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PairDto } from '@/modules/api/dto/pair.dto';

describe('API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<INestApplication>();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/search (GET)', () => {
    it('should return pairs for valid query', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'SOL/USDC' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 400 for empty query', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: '' })
        .expect(400);
    });

    it('should return 400 for missing query parameter', () => {
      return request(app.getHttpServer()).get('/search').expect(400);
    });
  });

  describe('/search/pair/:chainId/:pairId (GET)', () => {
    it('should return pair details for valid parameters', () => {
      const chainId = 'solana';
      const pairId = '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd';

      return request(app.getHttpServer())
        .get(`/search/pair/${chainId}/${pairId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const pairs = res.body as PairDto[];
          if (pairs.length > 0) {
            expect(pairs[0]).toHaveProperty('blockchain', chainId);
          }
        });
    });

    it('should handle invalid chainId format', () => {
      const chainId = 'invalid-chain';
      const pairId = '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd';

      return request(app.getHttpServer())
        .get(`/search/pair/${chainId}/${pairId}`)
        .expect((res) => {
          // Should either return 200 with empty array or handle error gracefully
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });

    it('should handle invalid pairId format', () => {
      const chainId = 'solana';
      const pairId = 'invalid-pair-id';

      return request(app.getHttpServer())
        .get(`/search/pair/${chainId}/${pairId}`)
        .expect((res) => {
          // Should either return 200 with empty array or handle error gracefully
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('/search/tokens/:chainId/:tokenAddress (GET)', () => {
    it('should return pairs for valid token address', () => {
      const chainId = 'solana';
      const tokenAddress = 'So11111111111111111111111111111111111111112';

      return request(app.getHttpServer())
        .get(`/search/tokens/${chainId}/${tokenAddress}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const pairs = res.body as PairDto[];
          if (pairs.length > 0) {
            expect(pairs[0]).toHaveProperty('blockchain', chainId);
            // Check if the token address matches either base or quote token
            const baseTokenAddress = pairs[0].baseToken.address;
            expect(baseTokenAddress === tokenAddress).toBe(true);
          }
        });
    });

    it('should handle invalid token address format', () => {
      const chainId = 'solana';
      const tokenAddress = 'invalid-token-address';

      return request(app.getHttpServer())
        .get(`/search/tokens/${chainId}/${tokenAddress}`)
        .expect((res) => {
          // Should either return 200 with empty array or handle error gracefully
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('Error handling', () => {
    it('should handle malformed URLs gracefully', () => {
      return request(app.getHttpServer())
        .get('/search/invalid/endpoint')
        .expect(404);
    });

    it('should handle missing parameters gracefully', () => {
      return request(app.getHttpServer())
        .get('/search/pair/solana')
        .expect(404);
    });

    it('should handle very long query parameters', () => {
      const longQuery = 'a'.repeat(1000);
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: longQuery })
        .expect((res) => {
          // Should either return 400 for too long query or handle gracefully
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(500);
        });
    });
  });

  describe('Response format validation', () => {
    it('should return consistent data structure for search results', () => {
      return request(app.getHttpServer())
        .get('/search')
        .query({ q: 'SOL' })
        .expect(200)
        .expect((res) => {
          const pairs = res.body as PairDto[];
          if (pairs.length > 0) {
            const pair = pairs[0];

            // Validate baseToken structure
            expect(pair.baseToken).toHaveProperty('address');
            expect(pair.baseToken).toHaveProperty('name');
            expect(pair.baseToken).toHaveProperty('symbol');
            expect(typeof pair.baseToken.address).toBe('string');
            expect(typeof pair.baseToken.name).toBe('string');
            expect(typeof pair.baseToken.symbol).toBe('string');

            // Validate quoteToken structure
            expect(pair.quoteToken).toHaveProperty('address');
            expect(pair.quoteToken).toHaveProperty('name');
            expect(pair.quoteToken).toHaveProperty('symbol');
            expect(typeof pair.quoteToken.address).toBe('string');
            expect(typeof pair.quoteToken.name).toBe('string');
            expect(typeof pair.quoteToken.symbol).toBe('string');

            // Validate liquidity structure
            expect(pair.liquidity).toHaveProperty('usd');
            expect(pair.liquidity).toHaveProperty('base');
            expect(pair.liquidity).toHaveProperty('quote');
            expect(typeof pair.liquidity.usd).toBe('number');
            expect(typeof pair.liquidity.base).toBe('number');
            expect(typeof pair.liquidity.quote).toBe('number');

            // Validate numeric fields
            expect(typeof pair.volume24h).toBe('number');
            expect(typeof pair.mcap).toBe('number');
            expect(typeof pair.pairCreatedAt).toBe('number');
            expect(typeof pair.trades24h).toBe('number');
            expect(typeof pair.priceChangePercent24h).toBe('number');

            // Validate string fields
            expect(typeof pair.blockchain).toBe('string');
            expect(typeof pair.dex).toBe('string');
            expect(typeof pair.pairAddress).toBe('string');
            expect(typeof pair.usdPrice).toBe('string');
            expect(typeof pair.priceInBaseToken).toBe('string');
            expect(typeof pair.logo).toBe('string');

            // Validate socials array
            expect(Array.isArray(pair.socials)).toBe(true);
            if (pair.socials.length > 0) {
              expect(pair.socials[0]).toHaveProperty('type');
              expect(pair.socials[0]).toHaveProperty('url');
              expect(typeof pair.socials[0].type).toBe('string');
              expect(typeof pair.socials[0].url).toBe('string');
            }
          }
        });
    });
  });
});

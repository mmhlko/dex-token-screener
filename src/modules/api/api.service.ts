import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../redis/redis.service';
import { PairDto } from './dto/pair.dto';
import { DexScreenerPair, DexScreenerResponse } from './dto/dexscreener.dto';
import { transformToPairDto } from './api.utils';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);
  private readonly baseUrl = 'https://api.dexscreener.com';
  constructor(
    private readonly http: HttpService,
    private readonly redisService: RedisService,
  ) {}

  async searchPairs(query: string): Promise<PairDto[]> {
    const cachedPairs = await this.redisService.getPairsByQuery(query);
    if (cachedPairs.length > 0) {
      // eslint-disable-next-line prettier/prettier
      this.logger.log(`Found ${cachedPairs.length} cached pairs by query: ${query}`);
      return cachedPairs;
    }
    try {
      const resp = await firstValueFrom(
        this.http.get<DexScreenerResponse>(
          `${this.baseUrl}/latest/dex/search`,
          {
            params: { q: query },
          },
        ),
      );
      this.logger.debug({ data: resp.data });
      const pairs = resp.data.pairs || [];
      if (pairs.length === 0) {
        return [];
      }
      this.logger.log(`Found ${pairs.length} pairs by query: ${query}`);
      const transformedPairs = transformToPairDto(pairs);
      await this.redisService.savePairsData({ pairs: transformedPairs, query });
      return transformedPairs;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error searchPairs: ${error.message}`);
      }
      throw error;
    }
  }

  async getPairByAddress(chainId: string, pairId: string): Promise<PairDto[]> {
    const cachedPair = await this.redisService.getPairData(pairId);
    if (cachedPair) {
      this.logger.log(`Found cached pair for: ${pairId}`);
      return [cachedPair];
    }

    try {
      const resp = await firstValueFrom(
        this.http.get<DexScreenerResponse>(
          `${this.baseUrl}/latest/dex/pairs/${chainId}/${pairId}`,
        ),
      );
      this.logger.debug({ data: resp.data });

      const pairs = resp.data.pairs || [];
      const transformedPairs = transformToPairDto(pairs);
      await this.redisService.savePairsData({ pairs: transformedPairs });
      return transformedPairs;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error getPairsByAddress: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Получение всех пар, связанных с токеном (до 30 токен-адресов) для цепочки
   */
  async getPairsByToken(
    chainId: string,
    tokenAddress: string,
  ): Promise<PairDto[]> {
    const cachedPairs = await this.redisService.getPairsByToken(tokenAddress);
    if (cachedPairs.length > 0) {
      this.logger.log(
        `Found ${cachedPairs.length} cached pairs for ${tokenAddress}`,
      );
      return cachedPairs;
    }

    try {
      const resp = await firstValueFrom(
        this.http.get<DexScreenerPair[]>(
          `${this.baseUrl}/tokens/v1/${chainId}/${tokenAddress}`,
        ),
      );
      this.logger.debug({ data: resp.data });
      const pairs = resp.data || [];
      const transformedPairs = transformToPairDto(pairs);
      await this.redisService.savePairsData({
        pairs: transformedPairs,
        tokenAddress,
      });
      return transformedPairs;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error getPairsByToken: ${error.message}`);
      }
      throw error;
    }
  }
}

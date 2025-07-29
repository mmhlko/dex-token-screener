import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { PairDto } from '../api/dto/pair.dto';

interface ISavePairsParams {
  pairs: PairDto[];
  query?: string;
  tokenAddress?: string;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private readonly TTL = 1 * 60 * 60;

  constructor(private readonly configService: ConfigService) {
    this.logger.debug({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD'),
    });
  }

  async onModuleInit() {
    await this.ensureClient();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  private async ensureClient() {
    if (!this.client) {
      this.client = new Redis({
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT'),
        password: this.configService.get<string>('REDIS_PASSWORD'),
      });

      this.client.on('error', (error: unknown) => {
        if (error instanceof Error) {
          this.logger.error('Connection Redis error:', error.message);
        } else {
          this.logger.error('Unknown Redis error:', error);
        }
      });

      this.client.on('connect', () => {
        this.logger.log('Connection Redis success');
      });

      await new Promise<void>((resolve, reject) => {
        if (this.client) {
          this.client.once('ready', resolve);
          this.client.once('error', reject);
        }
      });
    }
  }

  async getClient(): Promise<Redis> {
    await this.ensureClient();
    return this.client;
  }

  getPairKey(pairAddress: string) {
    return `pair:${pairAddress.toLowerCase().trim()}`;
  }

  getQueryKey(query: string) {
    return `query:${query.toLowerCase().trim()}`;
  }

  getTokenKey(tokenAddress: string) {
    return `token:${tokenAddress.toLowerCase().trim()}`;
  }

  async savePairsData({
    pairs,
    query,
    tokenAddress,
  }: ISavePairsParams): Promise<void> {
    this.logger.log(`Save ${pairs.length} pairs to Redis`);
    this.logger.debug({
      pairs: pairs.length,
      query,
      tokenAddress,
    });
    try {
      await this.ensureClient();
      const pipeline = this.client.pipeline();
      for (const pair of pairs) {
        this.logger.debug(`Save pair ${pair.pairAddress}`);
        const pairKey = this.getPairKey(pair.pairAddress);
        /* save pair by pairAddress */
        pipeline.set(pairKey, JSON.stringify(pair), 'EX', this.TTL);
        if (query) {
          this.logger.debug(query);

          const queryKey = this.getQueryKey(query);
          /* save pair link for queryKey */
          pipeline.sadd(queryKey, pair.pairAddress);
          pipeline.expire(queryKey, this.TTL);
        }
        if (tokenAddress) {
          /* save pair link for tokenKey */
          const tokenKey = this.getTokenKey(tokenAddress);
          this.logger.debug(`Save ${tokenKey}`);

          pipeline.sadd(tokenKey, pair.pairAddress);
          pipeline.expire(tokenKey, this.TTL);
        }
      }
      await pipeline.exec();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to save savePairsData for ${query}:`,
          error.message,
        );
      }
      throw error;
    }
  }

  async getPairsByQuery(query: string): Promise<PairDto[]> {
    const queryKey = this.getQueryKey(query);
    const pairAddresses = await this.client.smembers(queryKey);

    if (!pairAddresses.length) return [];

    const data = await this.client.mget(
      pairAddresses.map((address) => this.getPairKey(address)),
    );

    return data.filter((x) => x !== null).map((x) => JSON.parse(x) as PairDto);
  }

  async getPairsByToken(tokenAddress: string): Promise<PairDto[]> {
    const tokenKey = this.getTokenKey(tokenAddress);
    const pairAddresses = await this.client.smembers(tokenKey);

    if (!pairAddresses.length) return [];

    const data = await this.client.mget(
      pairAddresses.map((address) => this.getPairKey(address)),
    );
    return data.filter((x) => x !== null).map((x) => JSON.parse(x) as PairDto);
  }

  // Получаем данные по адресу пары
  async getPairData(pairAddress: string): Promise<PairDto | null> {
    const data = await this.client.get(this.getPairKey(pairAddress));
    if (!data) return null;
    return JSON.parse(data) as PairDto;
  }
}

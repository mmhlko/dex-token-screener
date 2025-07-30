import {
  Controller,
  Get,
  Query,
  Logger,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiService } from './api.service';
import { PairDto } from './dto/pair.dto';

@ApiTags('search')
@Controller('search')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(private readonly apiService: ApiService) {}

  @Get()
  @ApiOperation({ summary: 'Search for pairs matching query' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Token name, symbol or address',
    examples: {
      example1: { summary: 'Pair', value: 'SOL/USDC' },
      example2: { summary: 'Token name', value: 'XRP' },
    },
    type: String,
  })
  @ApiOkResponse({ description: 'List of pairs', type: [PairDto] })
  async searchPairs(@Query('q') query: string): Promise<PairDto[]> {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Query parameter "q" is required');
    }
    this.logger.log(`Searching pairs for: ${query}`);
    return this.apiService.searchPairs(query);
  }

  @Get('pair/:chainId/:pairId')
  @ApiOperation({ summary: 'Get detailed pair info' })
  @ApiParam({
    name: 'chainId',
    required: true,
    description: 'Chain identifier (e.g. solana, ethereum)',
    type: String,
    example: 'solana',
  })
  @ApiParam({
    name: 'pairId',
    required: true,
    description: 'Pair address',
    type: String,
    example: '2uf4xh61rdwxng9woyxsvqp7zua6klfpb3nvnrqeoisd',
  })
  @ApiOkResponse({ description: 'Pair details', type: [PairDto] })
  async getPairByAddress(
    @Param('chainId') chainId: string,
    @Param('pairId') pairId: string,
  ): Promise<any> {
    this.logger.log(`Get pair for chain ${chainId}, pairId ${pairId}`);
    return this.apiService.getPairByAddress(chainId, pairId);
  }

  @Get('tokens/:chainId/:tokenAddress')
  @ApiOperation({ summary: 'Search trading pairs by token address' })
  @ApiParam({
    name: 'chainId',
    description: 'Chain identifier (e.g. solana, ethereum)',
    required: true,
    type: String,
    example: 'polygon',
  })
  @ApiParam({
    name: 'tokenAddress',
    required: true,
    description: 'Token address',
    example: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  })
  @ApiOkResponse({ description: 'List of pairs', type: [PairDto] })
  async getPairsByToken(
    @Param('chainId') chainId: string,
    @Param('tokenAddress') tokenAddress: string,
  ): Promise<any> {
    this.logger.log(
      `Get token pairs for chain ${chainId}, token addresses ${tokenAddress}`,
    );
    return this.apiService.getPairsByToken(chainId, tokenAddress);
  }
}

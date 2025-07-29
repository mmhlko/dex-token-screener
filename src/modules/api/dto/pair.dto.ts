import { ApiProperty } from '@nestjs/swagger';

class TokenDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;
}

class LiquidityDto {
  @ApiProperty()
  usd: number;

  @ApiProperty()
  base: number;

  @ApiProperty()
  quote: number;
}

class SocialDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  url: string;
}

export class PairDto {
  @ApiProperty()
  blockchain: string;

  @ApiProperty()
  dex: string;

  @ApiProperty()
  pairAddress: string;

  @ApiProperty({ type: TokenDto })
  baseToken: TokenDto;

  @ApiProperty({ type: TokenDto })
  quoteToken: TokenDto;

  @ApiProperty({ type: LiquidityDto })
  liquidity: LiquidityDto;

  @ApiProperty()
  volume24h: number;

  @ApiProperty()
  mcap: number;

  @ApiProperty()
  pairCreatedAt: number;

  @ApiProperty()
  trades24h: number;

  @ApiProperty()
  usdPrice: string;

  @ApiProperty()
  priceInBaseToken: string;

  @ApiProperty()
  priceChangePercent24h: number;

  @ApiProperty()
  logo: string;

  @ApiProperty({ type: [SocialDto] })
  socials: SocialDto[];
}

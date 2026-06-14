import { IsString, IsUrl, IsOptional, MaxLength } from 'class-validator';

export class CreateScanDto {
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: false })
  @MaxLength(2048)
  url: string;

  @IsOptional()
  @IsString()
  guestToken?: string;
}

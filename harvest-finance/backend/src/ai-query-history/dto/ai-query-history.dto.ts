import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateAiQueryHistoryDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsString()
  @IsNotEmpty()
  response: string;

  @IsOptional()
  @IsObject()
  vaultContext?: Record<string, any>;

  @IsOptional()
  @IsObject()
  seasonalData?: Record<string, any>;
}

export class AiQueryHistoryResponseDto {
  id: string;
  query: string;
  response: string;
  vaultContext: Record<string, any> | null;
  seasonalData: Record<string, any> | null;
  createdAt: Date;
}

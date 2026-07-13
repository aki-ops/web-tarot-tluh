import { IsString, IsOptional, IsIn, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DrawCardItemDto {
  @IsString()
  position: string; // "past", "present", "future" or "single"

  @IsString()
  cardId: string;

  @IsOptional()
  isReversed?: boolean = false;
}

export class CreateDrawDto {
  @IsString()
  @IsIn(['three_card', 'single_card'])
  type: string;

  @IsOptional()
  @IsString()
  @IsIn(['today', 'what_to_do', 'what_should_do'])
  intent?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawCardItemDto)
  cards: DrawCardItemDto[];
}

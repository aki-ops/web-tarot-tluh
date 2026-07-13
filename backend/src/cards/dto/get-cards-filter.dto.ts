import { IsOptional, IsIn } from 'class-validator';

export class GetCardsFilterDto {
  @IsOptional()
  @IsIn(['major', 'minor'], {
    message: 'arcanaType must be either "major" or "minor"',
  })
  arcanaType?: string;

  @IsOptional()
  @IsIn(['wands', 'cups', 'swords', 'pentacles'], {
    message: 'suit must be one of "wands", "cups", "swords", "pentacles"',
  })
  suit?: string;
}

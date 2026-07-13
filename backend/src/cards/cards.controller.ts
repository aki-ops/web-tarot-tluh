import { Controller, Get, Param, Query } from '@nestjs/common';
import { CardsService } from './cards.service';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  async findAll(@Query() filterDto: GetCardsFilterDto) {
    return this.cardsService.findAll(filterDto);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.cardsService.findBySlug(slug);
  }
}

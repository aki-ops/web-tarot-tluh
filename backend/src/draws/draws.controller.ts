import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { DrawsService } from './draws.service';
import { CreateDrawDto } from './dto/create-draw.dto';

@Controller('draws')
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Post()
  async create(@Body() createDrawDto: CreateDrawDto) {
    return this.drawsService.create(createDrawDto);
  }

  @Get()
  async findAll() {
    return this.drawsService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.drawsService.delete(id);
  }
}

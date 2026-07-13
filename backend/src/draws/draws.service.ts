import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDrawDto } from './dto/create-draw.dto';

@Injectable()
export class DrawsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDrawDto: CreateDrawDto) {
    return this.prisma.draw.create({
      data: {
        type: createDrawDto.type,
        intent: createDrawDto.intent || null,
        cards: createDrawDto.cards as any, // Array of {position, cardId, isReversed}
      },
    });
  }

  async findAll() {
    return this.prisma.draw.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async delete(id: string) {
    return this.prisma.draw.delete({
      where: { id },
    });
  }
}

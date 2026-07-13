import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { arcanaType?: string; suit?: string }) {
    const where: any = {};
    if (filters.arcanaType) {
      where.arcanaType = filters.arcanaType;
    }
    if (filters.suit) {
      where.suit = filters.suit;
    }

    return this.prisma.card.findMany({
      where,
      orderBy: {
        createdAt: 'asc', // Or keep RWS order if needed. Sorting by createdAt is fine.
      },
    });
  }

  async findBySlug(slug: string) {
    const card = await this.prisma.card.findUnique({
      where: { slug },
    });
    if (!card) {
      throw new NotFoundException(`Card with slug "${slug}" not found`);
    }
    return card;
  }
}

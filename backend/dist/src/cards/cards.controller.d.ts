import { CardsService } from './cards.service';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';
export declare class CardsController {
    private readonly cardsService;
    constructor(cardsService: CardsService);
    findAll(filterDto: GetCardsFilterDto): Promise<{
        number: string;
        id: string;
        slug: string;
        arcanaType: string;
        suit: string | null;
        nameEn: string;
        nameVi: string;
        imageUrl: string;
        keywords: import("@prisma/client/runtime/client").JsonValue;
        actionGroups: import("@prisma/client/runtime/client").JsonValue;
        quickMeaning: string;
        detailedDescription: string;
        uprightMeaning: string;
        reversedMeaning: string | null;
        opposingCardSlugs: import("@prisma/client/runtime/client").JsonValue;
        supportingCardSlugs: import("@prisma/client/runtime/client").JsonValue;
        sourceUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findBySlug(slug: string): Promise<{
        number: string;
        id: string;
        slug: string;
        arcanaType: string;
        suit: string | null;
        nameEn: string;
        nameVi: string;
        imageUrl: string;
        keywords: import("@prisma/client/runtime/client").JsonValue;
        actionGroups: import("@prisma/client/runtime/client").JsonValue;
        quickMeaning: string;
        detailedDescription: string;
        uprightMeaning: string;
        reversedMeaning: string | null;
        opposingCardSlugs: import("@prisma/client/runtime/client").JsonValue;
        supportingCardSlugs: import("@prisma/client/runtime/client").JsonValue;
        sourceUrl: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

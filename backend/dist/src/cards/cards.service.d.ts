import { PrismaService } from '../prisma/prisma.service';
export declare class CardsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(filters: {
        arcanaType?: string;
        suit?: string;
    }): Promise<{
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

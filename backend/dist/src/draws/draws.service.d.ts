import { PrismaService } from '../prisma/prisma.service';
import { CreateDrawDto } from './dto/create-draw.dto';
export declare class DrawsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createDrawDto: CreateDrawDto): Promise<{
        id: string;
        createdAt: Date;
        cards: import("@prisma/client/runtime/client").JsonValue;
        type: string;
        intent: string | null;
        userId: string | null;
        roomId: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        cards: import("@prisma/client/runtime/client").JsonValue;
        type: string;
        intent: string | null;
        userId: string | null;
        roomId: string | null;
    }[]>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        cards: import("@prisma/client/runtime/client").JsonValue;
        type: string;
        intent: string | null;
        userId: string | null;
        roomId: string | null;
    }>;
}

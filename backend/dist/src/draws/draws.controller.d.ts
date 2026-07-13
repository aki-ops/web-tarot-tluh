import { DrawsService } from './draws.service';
import { CreateDrawDto } from './dto/create-draw.dto';
export declare class DrawsController {
    private readonly drawsService;
    constructor(drawsService: DrawsService);
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

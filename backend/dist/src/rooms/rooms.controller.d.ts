import { PrismaService } from '../prisma/prisma.service';
export declare class RoomsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createRoom(req: any, body: {
        name: string;
    }): Promise<{
        id: string;
        code: string;
        name: string;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    register(dto: any): Promise<{
        id: string;
        email: string;
        nickname: string;
        avatarUrl: string | null;
    }>;
    login(dto: any): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            nickname: string;
            avatarUrl: string | null;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        nickname: string;
        avatarUrl: string | null;
    }>;
}

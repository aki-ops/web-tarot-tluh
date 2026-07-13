import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getMe(req: any): Promise<{
        id: string;
        email: string;
        nickname: string;
        avatarUrl: string | null;
    }>;
}

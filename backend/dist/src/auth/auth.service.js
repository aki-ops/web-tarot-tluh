"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_helper_1 = require("./crypto.helper");
let AuthService = class AuthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async register(dto) {
        const { email, nickname, password } = dto;
        if (!email || !nickname || !password) {
            throw new common_1.BadRequestException('Vui lòng điền đầy đủ thông tin đăng ký');
        }
        const existingEmail = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingEmail) {
            throw new common_1.BadRequestException('Email này đã được sử dụng');
        }
        const existingNickname = await this.prisma.user.findUnique({
            where: { nickname },
        });
        if (existingNickname) {
            throw new common_1.BadRequestException('Nickname này đã được sử dụng');
        }
        const rand = Math.floor(Math.random() * 4) + 1;
        const avatarUrl = `/images/avatars/frog${rand}.png`;
        const hashedPassword = await (0, crypto_helper_1.hashPassword)(password);
        const user = await this.prisma.user.create({
            data: {
                email,
                nickname,
                password: hashedPassword,
                avatarUrl,
            },
        });
        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl,
        };
    }
    async login(dto) {
        const { usernameOrEmail, password } = dto;
        if (!usernameOrEmail || !password) {
            throw new common_1.BadRequestException('Vui lòng nhập tài khoản và mật khẩu');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: usernameOrEmail },
                    { nickname: usernameOrEmail }
                ]
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = await (0, crypto_helper_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
        }
        const token = (0, crypto_helper_1.generateToken)({
            id: user.id,
            email: user.email,
            nickname: user.nickname,
        });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                avatarUrl: user.avatarUrl,
            }
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Không tìm thấy người dùng');
        }
        return {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            avatarUrl: user.avatarUrl,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
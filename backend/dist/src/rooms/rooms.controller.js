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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RoomsController = class RoomsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRoom(req, body) {
        const { name } = body;
        const hostId = req.user.id;
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };
        let code = generateCode();
        let roomExists = await this.prisma.room.findUnique({ where: { code } });
        while (roomExists) {
            code = generateCode();
            roomExists = await this.prisma.room.findUnique({ where: { code } });
        }
        const room = await this.prisma.room.create({
            data: {
                name: name || `Phòng Tarot của ${req.user.nickname}`,
                code,
                hostId,
            },
        });
        return {
            id: room.id,
            code: room.code,
            name: room.name,
        };
    }
};
exports.RoomsController = RoomsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoomsController.prototype, "createRoom", null);
exports.RoomsController = RoomsController = __decorate([
    (0, common_1.Controller)('rooms'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsController);
//# sourceMappingURL=rooms.controller.js.map
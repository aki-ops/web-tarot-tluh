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
exports.DrawsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DrawsService = class DrawsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDrawDto) {
        return this.prisma.draw.create({
            data: {
                type: createDrawDto.type,
                intent: createDrawDto.intent || null,
                cards: createDrawDto.cards,
            },
        });
    }
    async findAll() {
        return this.prisma.draw.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async delete(id) {
        return this.prisma.draw.delete({
            where: { id },
        });
    }
};
exports.DrawsService = DrawsService;
exports.DrawsService = DrawsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DrawsService);
//# sourceMappingURL=draws.service.js.map
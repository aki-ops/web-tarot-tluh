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
exports.DrawsController = void 0;
const common_1 = require("@nestjs/common");
const draws_service_1 = require("./draws.service");
const create_draw_dto_1 = require("./dto/create-draw.dto");
let DrawsController = class DrawsController {
    drawsService;
    constructor(drawsService) {
        this.drawsService = drawsService;
    }
    async create(createDrawDto) {
        return this.drawsService.create(createDrawDto);
    }
    async findAll() {
        return this.drawsService.findAll();
    }
    async delete(id) {
        return this.drawsService.delete(id);
    }
};
exports.DrawsController = DrawsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_draw_dto_1.CreateDrawDto]),
    __metadata("design:returntype", Promise)
], DrawsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DrawsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrawsController.prototype, "delete", null);
exports.DrawsController = DrawsController = __decorate([
    (0, common_1.Controller)('draws'),
    __metadata("design:paramtypes", [draws_service_1.DrawsService])
], DrawsController);
//# sourceMappingURL=draws.controller.js.map
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
exports.RoomsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_helper_1 = require("../auth/crypto.helper");
let RoomsGateway = class RoomsGateway {
    prisma;
    server;
    activeRooms = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    handleConnection(client) {
        console.log(`Client kết nối Socket: ${client.id}`);
    }
    async handleDisconnect(client) {
        console.log(`Client ngắt kết nối Socket: ${client.id}`);
        const roomCode = client.data.roomCode;
        const nickname = client.data.nickname;
        if (roomCode && this.activeRooms.has(roomCode)) {
            let participants = this.activeRooms.get(roomCode) || [];
            participants = participants.filter((p) => p.socketId !== client.id);
            if (participants.length === 0) {
                this.activeRooms.delete(roomCode);
            }
            else {
                this.activeRooms.set(roomCode, participants);
                this.server.to(roomCode).emit('room-state', participants);
                this.server.to(roomCode).emit('sys-message', {
                    type: 'info',
                    message: `${nickname} đã rời phòng.`,
                });
            }
        }
    }
    async handleJoinRoom(client, payload) {
        const { roomCode, token } = payload;
        if (!roomCode) {
            client.emit('error', 'Mã phòng không hợp lệ');
            return;
        }
        const room = await this.prisma.room.findUnique({
            where: { code: roomCode.toUpperCase() },
            include: { host: true },
        });
        if (!room) {
            client.emit('error', 'Phòng không tồn tại');
            return;
        }
        let participants = this.activeRooms.get(roomCode) || [];
        if (participants.length >= 4) {
            client.emit('error', 'Phòng đã đầy (tối đa 4 người)');
            return;
        }
        let userId;
        let nickname = '';
        let avatarUrl = '/images/avatars/frog1.png';
        let isHost = false;
        if (token) {
            const userPayload = (0, crypto_helper_1.verifyToken)(token);
            if (userPayload) {
                userId = userPayload.id;
                const user = await this.prisma.user.findUnique({ where: { id: userId } });
                if (user) {
                    nickname = user.nickname;
                    avatarUrl = user.avatarUrl || avatarUrl;
                    isHost = room.hostId === user.id;
                }
            }
        }
        if (!nickname) {
            const guestIndices = participants
                .map((p) => {
                const match = p.nickname.match(/^guest_(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
            })
                .filter((idx) => idx > 0);
            let nextIndex = 1;
            while (guestIndices.includes(nextIndex)) {
                nextIndex++;
            }
            nickname = `guest_${nextIndex}`;
            const rand = Math.floor(Math.random() * 4) + 1;
            avatarUrl = `/images/avatars/frog${rand}.png`;
        }
        client.join(roomCode);
        client.data = { roomCode, nickname };
        const newParticipant = {
            socketId: client.id,
            userId,
            nickname,
            avatarUrl,
            isMuted: true,
            isHost,
        };
        participants.push(newParticipant);
        this.activeRooms.set(roomCode, participants);
        this.server.to(roomCode).emit('room-state', participants);
        this.server.to(roomCode).emit('sys-message', {
            type: 'info',
            message: `${nickname} đã tham gia phòng.`,
        });
    }
    handleMuteToggle(client, payload) {
        const roomCode = client.data.roomCode;
        if (!roomCode || !this.activeRooms.has(roomCode))
            return;
        const participants = this.activeRooms.get(roomCode) || [];
        const participant = participants.find((p) => p.socketId === client.id);
        if (participant) {
            participant.isMuted = payload.isMuted;
            this.server.to(roomCode).emit('room-state', participants);
        }
    }
    handleSpeakingState(client, payload) {
        const roomCode = client.data.roomCode;
        if (!roomCode)
            return;
        client.to(roomCode).emit('speaking-state', {
            socketId: client.id,
            isSpeaking: payload.isSpeaking,
        });
    }
    handleWebRTCSignal(client, payload) {
        const { targetSocketId, signalData } = payload;
        this.server.to(targetSocketId).emit('webrtc-signal', {
            senderSocketId: client.id,
            signalData,
        });
    }
    async handleDrawAction(client, payload) {
        const roomCode = client.data.roomCode;
        if (!roomCode || !this.activeRooms.has(roomCode))
            return;
        const participants = this.activeRooms.get(roomCode) || [];
        const sender = participants.find((p) => p.socketId === client.id);
        if (sender && sender.isHost) {
            client.to(roomCode).emit('draw-action', payload);
        }
    }
};
exports.RoomsGateway = RoomsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RoomsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mute-toggle'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomsGateway.prototype, "handleMuteToggle", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('speaking-state'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomsGateway.prototype, "handleSpeakingState", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc-signal'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomsGateway.prototype, "handleWebRTCSignal", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('draw-action'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RoomsGateway.prototype, "handleDrawAction", null);
exports.RoomsGateway = RoomsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoomsGateway);
//# sourceMappingURL=rooms.gateway.js.map
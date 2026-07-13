import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
export declare class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly prisma;
    server: Server;
    private activeRooms;
    constructor(prisma: PrismaService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(client: Socket, payload: {
        roomCode: string;
        token?: string;
    }): Promise<void>;
    handleMuteToggle(client: Socket, payload: {
        isMuted: boolean;
    }): void;
    handleSpeakingState(client: Socket, payload: {
        isSpeaking: boolean;
    }): void;
    handleWebRTCSignal(client: Socket, payload: {
        targetSocketId: string;
        signalData: any;
    }): void;
    handleDrawAction(client: Socket, payload: any): Promise<void>;
}

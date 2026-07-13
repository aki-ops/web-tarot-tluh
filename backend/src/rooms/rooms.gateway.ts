import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { verifyToken } from '../auth/crypto.helper';

interface Participant {
  socketId: string;
  userId?: string;
  nickname: string;
  avatarUrl: string;
  isMuted: boolean;
  isHost: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Quản lý các phòng thoại trong bộ nhớ đệm
  private activeRooms: Map<string, Participant[]> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    console.log(`Client kết nối Socket: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client ngắt kết nối Socket: ${client.id}`);
    const roomCode = client.data.roomCode;
    const nickname = client.data.nickname;

    if (roomCode && this.activeRooms.has(roomCode)) {
      let participants = this.activeRooms.get(roomCode) || [];
      participants = participants.filter((p) => p.socketId !== client.id);
      
      if (participants.length === 0) {
        this.activeRooms.delete(roomCode);
      } else {
        this.activeRooms.set(roomCode, participants);
        this.server.to(roomCode).emit('room-state', participants);
        this.server.to(roomCode).emit('sys-message', {
          type: 'info',
          message: `${nickname} đã rời phòng.`,
        });
      }
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, payload: { roomCode: string; token?: string }) {
    const { roomCode, token } = payload;

    if (!roomCode) {
      client.emit('error', 'Mã phòng không hợp lệ');
      return;
    }

    // Kiểm tra phòng trong cơ sở dữ liệu
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

    let userId: string | undefined;
    let nickname = '';
    let avatarUrl = '/images/avatars/frog1.png';
    let isHost = false;

    // Xác thực người dùng nếu có token
    if (token) {
      const userPayload = verifyToken(token);
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

    // Nếu không đăng nhập (Guest), sinh nickname tự động
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
      // Gán ngẫu nhiên avatar ếch xanh cho guest
      const rand = Math.floor(Math.random() * 4) + 1;
      avatarUrl = `/images/avatars/frog${rand}.png`;
    }

    // Đưa client vào room của socket.io
    client.join(roomCode);
    client.data = { roomCode, nickname };

    // Tạo thông tin người tham gia (luôn tắt mic mặc định)
    const newParticipant: Participant = {
      socketId: client.id,
      userId,
      nickname,
      avatarUrl,
      isMuted: true,
      isHost,
    };

    participants.push(newParticipant);
    this.activeRooms.set(roomCode, participants);

    // Đồng bộ danh sách người tham gia mới cho cả phòng
    this.server.to(roomCode).emit('room-state', participants);
    this.server.to(roomCode).emit('sys-message', {
      type: 'info',
      message: `${nickname} đã tham gia phòng.`,
    });
  }

  @SubscribeMessage('mute-toggle')
  handleMuteToggle(client: Socket, payload: { isMuted: boolean }) {
    const roomCode = client.data.roomCode;
    if (!roomCode || !this.activeRooms.has(roomCode)) return;

    const participants = this.activeRooms.get(roomCode) || [];
    const participant = participants.find((p) => p.socketId === client.id);
    
    if (participant) {
      participant.isMuted = payload.isMuted;
      this.server.to(roomCode).emit('room-state', participants);
    }
  }

  // Tín hiệu chỉ báo nói chuyện
  @SubscribeMessage('speaking-state')
  handleSpeakingState(client: Socket, payload: { isSpeaking: boolean }) {
    const roomCode = client.data.roomCode;
    if (!roomCode) return;
    
    // Phát tin tới những người khác để nháy sáng avatar
    client.to(roomCode).emit('speaking-state', {
      socketId: client.id,
      isSpeaking: payload.isSpeaking,
    });
  }

  // WebRTC Audio Signaling broker
  @SubscribeMessage('webrtc-signal')
  handleWebRTCSignal(client: Socket, payload: { targetSocketId: string; signalData: any }) {
    const { targetSocketId, signalData } = payload;
    this.server.to(targetSocketId).emit('webrtc-signal', {
      senderSocketId: client.id,
      signalData,
    });
  }

  // Đồng bộ hoá thao tác bốc bài Tarot từ Reader (Host)
  @SubscribeMessage('draw-action')
  async handleDrawAction(client: Socket, payload: any) {
    const roomCode = client.data.roomCode;
    if (!roomCode || !this.activeRooms.has(roomCode)) return;

    const participants = this.activeRooms.get(roomCode) || [];
    const sender = participants.find((p) => p.socketId === client.id);

    // Chỉ chủ phòng (Host) mới được thực hiện xào/bốc/lật bài
    if (sender && sender.isHost) {
      client.to(roomCode).emit('draw-action', payload);
    }
  }
}

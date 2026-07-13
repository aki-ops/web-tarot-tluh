import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createRoom(@Req() req: any, @Body() body: { name: string }) {
    const { name } = body;
    const hostId = req.user.id;

    // Hàm tạo mã phòng ngẫu nhiên 6 ký tự
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let code = generateCode();
    
    // Kiểm tra trùng lặp mã phòng
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
}

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, verifyPassword, generateToken } from './crypto.helper';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: any) {
    const { email, nickname, password } = dto;

    if (!email || !nickname || !password) {
      throw new BadRequestException('Vui lòng điền đầy đủ thông tin đăng ký');
    }

    // Kiểm tra email trùng
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    // Kiểm tra nickname trùng
    const existingNickname = await this.prisma.user.findUnique({
      where: { nickname },
    });
    if (existingNickname) {
      throw new BadRequestException('Nickname này đã được sử dụng');
    }

    // Chọn ngẫu nhiên 1 trong 4 ảnh avatar ếch xanh meme
    const rand = Math.floor(Math.random() * 4) + 1;
    const avatarUrl = `/images/avatars/frog${rand}.png`;

    // Mã hoá mật khẩu
    const hashedPassword = await hashPassword(password);

    // Lưu User vào cơ sở dữ liệu
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

  async login(dto: any) {
    const { usernameOrEmail, password } = dto;

    if (!usernameOrEmail || !password) {
      throw new BadRequestException('Vui lòng nhập tài khoản và mật khẩu');
    }

    // Tìm kiếm bằng email hoặc nickname
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { nickname: usernameOrEmail }
        ]
      }
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Tài khoản hoặc mật khẩu không chính xác');
    }

    // Tạo JWT token
    const token = generateToken({
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

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy người dùng');
    }
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
    };
  }
}

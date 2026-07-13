import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyToken } from './crypto.helper';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Không tìm thấy token uỷ quyền');
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Sai định dạng token uỷ quyền');
    }

    const token = parts[1];
    const payload = verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('Phiên đăng nhập hết hạn hoặc không hợp lệ');
    }

    request.user = payload;
    return true;
  }
}

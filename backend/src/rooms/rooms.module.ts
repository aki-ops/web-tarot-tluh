import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { RoomsController } from './rooms.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomsController],
  providers: [RoomsGateway],
})
export class RoomsModule {}

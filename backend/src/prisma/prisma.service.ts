import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let dbPath = '';
    if (process.env.DATABASE_URL) {
      const cleanUrl = process.env.DATABASE_URL.replace('file:', '');
      if (cleanUrl.startsWith('.')) {
        dbPath = path.resolve(process.cwd(), cleanUrl);
      } else {
        dbPath = cleanUrl;
      }
    } else {
      dbPath = path.resolve(process.cwd(), 'dev.db');
    }
    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

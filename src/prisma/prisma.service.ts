import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // For local development with SQLite, we simplify this to avoid conflicts with Vercel config for now.
    // The previous complex logic was causing issues with Prisma Client initialization in local mode.
    // We will stick to SQLite for local dev as requested.
    
    const adapter = new PrismaBetterSqlite3({
      url: 'file:./dev.db',
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

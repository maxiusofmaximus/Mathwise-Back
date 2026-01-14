import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      // Force a check because adapter connection might be lazy
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Database connection established successfully');
    } catch (error) {
      // In Serverless environments, we should not crash the process on init,
      // but rather let the request fail so we can return a proper 500 error with CORS headers.
      this.logger.error('Failed to connect to database during initialization', error);
      
      // We do NOT rethrow here to allow the NestJS app to bootstrap.
      // The first actual DB request will fail and be caught by the ExceptionFilter.
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}

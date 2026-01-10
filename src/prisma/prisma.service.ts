import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // Production: Use Vercel/Supabase Env Vars
    let connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
    
    // Force SSL no-verify in the connection string itself
    if (connectionString && !connectionString.includes('sslmode=no-verify')) {
       connectionString += connectionString.includes('?') ? '&sslmode=no-verify' : '?sslmode=no-verify';
    }

    const pool = new Pool({ 
      connectionString,
      ssl: { rejectUnauthorized: false } // Keep this just in case
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

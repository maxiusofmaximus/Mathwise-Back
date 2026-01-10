import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { QuizModule } from './quiz/quiz.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, QuizModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

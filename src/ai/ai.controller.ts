import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  generateQuestion(@Body() params: any) {
    return this.aiService.generateQuestion(params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('evaluate')
  evaluateAnswer(@Body() params: any) {
    return this.aiService.evaluateAnswer(params);
  }
}

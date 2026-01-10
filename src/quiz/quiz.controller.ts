import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(@Body() createQuizDto: any, @Request() req) {
    return this.quizService.create(createQuizDto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: any) {
    // Basic filtering can be enhanced
    return this.quizService.findAll({
      where: {
        is_published: query.published === 'true' ? true : undefined,
      },
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }
}

import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
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

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  getMyQuizzes(@Request() req) {
    return this.quizService.getMyQuizzes(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Body() updateQuizDto: any, @Request() req) {
    return this.quizService.update(id, updateQuizDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('selection-data')
  async getSelectionData() {
    // This ideally belongs in a separate service/controller but placed here for speed
    // We need to access prisma directly or through a service method.
    // Let's assume we can add getSelectionData to QuizService.
    return this.quizService.getSelectionData();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req, @Query() query: any) {
    if (req.user.role === 'student') {
      return this.quizService.findAvailableForStudent(req.user.userId);
    }
    
    // For editors/admins, return all (with filters)
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

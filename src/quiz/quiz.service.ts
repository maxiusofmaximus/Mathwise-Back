import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Difficulty, QuestionType } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const { questions, ...quizData } = data;
    
    return this.prisma.quiz.create({
      data: {
        ...quizData,
        difficulty: quizData.difficulty as Difficulty,
        created_by: userId,
        questions: questions ? {
          create: questions.map((q: any) => ({
            type: q.type as QuestionType,
            content: q.content,
            expected_answer: q.expected_answer,
            explanation: q.explanation,
            tolerance: q.tolerance,
            weight: q.weight,
            keywords: q.keywords,
            order_index: q.order_index,
          })),
        } : undefined,
      },
      include: {
        questions: true,
      },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.QuizWhereUniqueInput;
    where?: Prisma.QuizWhereInput;
    orderBy?: Prisma.QuizOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.quiz.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: {
            order_index: 'asc',
          },
        },
        creator: {
          select: { name: true, email: true }
        }
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }
}

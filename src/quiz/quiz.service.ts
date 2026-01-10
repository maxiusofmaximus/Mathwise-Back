import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Difficulty, QuestionType } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, userId: string) {
    const { questions, allowed_students, allowed_groups, ...quizData } = data;
    
    return this.prisma.quiz.create({
      data: {
        ...quizData,
        difficulty: quizData.difficulty as Difficulty,
        created_by: userId,
        // Relations
        allowed_students: allowed_students ? {
          connect: allowed_students.map((id: string) => ({ id }))
        } : undefined,
        allowed_groups: allowed_groups ? {
          connect: allowed_groups.map((id: string) => ({ id }))
        } : undefined,
        questions: questions ? {
          create: questions.map((q: any) => ({
            type: q.type as QuestionType,
            content: q.content,
            expected_answer: q.expected_answer,
            explanation: q.explanation,
            tolerance: q.tolerance,
            weight: q.weight,
            keywords: q.options ? { options: q.options, keywords: q.keywords } : q.keywords,
            order_index: q.order_index,
          })),
        } : undefined,
      },
      include: {
        questions: true,
      },
    });
  }

  async update(id: string, data: any, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.created_by !== userId) throw new UnauthorizedException('You can only edit your own quizzes');

    const { questions, allowed_students, allowed_groups, ...quizData } = data;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Update Quiz Metadata
      const updatedQuiz = await prisma.quiz.update({
        where: { id },
        data: {
          title: quizData.title,
          description: quizData.description,
          difficulty: quizData.difficulty as Difficulty,
          is_published: quizData.is_published,
          // Scheduling
          start_at: quizData.start_at ? new Date(quizData.start_at) : null,
          end_at: quizData.end_at ? new Date(quizData.end_at) : null,
          feedback_mode: quizData.feedback_mode,
          time_limit: quizData.time_limit,
          assign_to_all: quizData.assign_to_all,
          // Relations Update (Set replaces existing)
          allowed_students: allowed_students ? {
            set: allowed_students.map((id: string) => ({ id }))
          } : undefined,
          allowed_groups: allowed_groups ? {
            set: allowed_groups.map((id: string) => ({ id }))
          } : undefined,
        },
      });

      // 2. Handle Questions
      if (questions && Array.isArray(questions)) {
        // ... existing question logic ...
        for (const q of questions) {
          const questionData = {
            type: q.type as QuestionType,
            content: q.content,
            expected_answer: q.expected_answer,
            explanation: q.explanation,
            tolerance: q.tolerance,
            weight: q.weight,
            keywords: q.options ? { options: q.options, keywords: q.keywords } : q.keywords,
            order_index: q.order_index,
          };

          if (q.id) {
            // Update existing
            await prisma.question.update({
              where: { id: q.id },
              data: questionData,
            });
          } else {
            // Create new
            await prisma.question.create({
              data: {
                ...questionData,
                quiz_id: id,
              },
            });
          }
        }
      }

      return updatedQuiz;
    });
  }

  async getMyQuizzes(userId: string) {
    return this.prisma.quiz.findMany({
      where: { created_by: userId },
      include: {
        _count: { select: { questions: true, attempts: true } }
      },
      orderBy: { updated_at: 'desc' }
    });
  }


  async getSelectionData() {
    const students = await this.prisma.user.findMany({
      where: { role: 'student' },
      select: { id: true, name: true, email: true }
    });
    
    const groups = await this.prisma.group.findMany({
      select: { id: true, name: true }
    });

    return { students, groups };
  }

  async findAvailableForStudent(userId: string) {
    const now = new Date();
    
    return this.prisma.quiz.findMany({
      where: {
        is_published: true,
        // Time window check
        AND: [
          { OR: [{ start_at: null }, { start_at: { lte: now } }] },
          { OR: [{ end_at: null }, { end_at: { gte: now } }] }
        ],
        // Assignment check
        OR: [
          { assign_to_all: true },
          { allowed_students: { some: { id: userId } } },
          { allowed_groups: { some: { students: { some: { id: userId } } } } }
        ]
      },
      include: {
        creator: { select: { name: true, email: true } },
        _count: { select: { questions: true } }
      }
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
        },
        allowed_students: { select: { id: true } },
        allowed_groups: { select: { id: true } }
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }
}

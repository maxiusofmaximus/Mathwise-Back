import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(private readonly httpService: HttpService) {}

  async generateQuestion(params: any) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/generate`, params)
      );
      return response.data;
    } catch (error) {
      console.error('Error generating question:', error);
      throw new InternalServerErrorException('Failed to generate question from AI service');
    }
  }

  async evaluateAnswer(params: any) {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/evaluate`, params)
      );
      return response.data;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw new InternalServerErrorException('Failed to evaluate answer via AI service');
    }
  }
}

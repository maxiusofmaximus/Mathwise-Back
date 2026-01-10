import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { HttpService } from '@nestjs/axios';

describe('AiService', () => {
  let service: AiService;
  
  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

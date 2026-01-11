import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

let cachedServer: any;

const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://mathwise-seven.vercel.app',
      'https://mathwise-front.vercel.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  await app.init();
  return app;
};

export default async function handler(req, res) {
  if (!cachedServer) {
    const server = express();
    await createNestServer(server);
    cachedServer = server;
  }

  return cachedServer(req, res);
}

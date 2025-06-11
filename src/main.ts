import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as express from 'express';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(compression());
  app.use(helmet());

  app.enableCors({
    origin: '*',
    methods: 'POST, DELETE, GET, PATCH',
    credentials: true,
    allowedHeaders:
      'Content-Type, Authorization, X-Requested-With, token, Accept, Api-Key',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Backend Assessment')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();

  const config = new DocumentBuilder()
    .setTitle('Nest API')
    .setDescription('API to process Electricity payment from a Bill Vending')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    console.warn(` 
      --------------------------------------
      Application Server Sucessful!
      API Docs: localhost:${port}/api
      --------------------------------------
    `);
  });
}
bootstrap();

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const configureSwagger = (app) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CASANOW API V1')
    .setDescription('Comprehensive documentation for the CASANOW API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'AdminJWT',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'CustomerJWT',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'ChangeDeviceJWT',
    )
    .addTag('CASANOW Docs', 'Documentation for the CASANOW API endpoints')
    .setExternalDoc('Postman Collection', '/documentation-json')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/documentation', app, swaggerDocument);
};

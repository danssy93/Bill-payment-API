import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

const config: ConfigService = new ConfigService();

export enum EnvironmentType {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOP = 'develop',
  TEST = 'test',
}

export enum EnvironmentMode {
  SANDBOX = 'sandbox',
  LIVE = 'live',
}

const configuration = () => ({
  APP: {
    NAME: config.get<string>('APP_NAME'),
    PORT: config.get<number>('APP_PORT') || 3000,
    DEBUG: config.get<string>('APP_DEBUG') == 'true' ? true : false,
    TIMEZONE: config.get<string>('APP_TIMEZONE') || 'Africa/Lagos',
    URL: config.get<string>('API_URL'),
    ENV: config.get<EnvironmentType>('APP_ENV'),
    SECRET: config.get<string>('APP_SECRET'),
  },

  DATABASE: {
    HOST: config.get<string>('DB_HOST'),
    PORT: config.get<number>('DB_PORT'),
    PASSWORD: config.get<string>('DB_PASSWORD'),
    NAME: config.get<string>('DB_NAME'),
    USERNAME: config.get<string>('DB_USER'),
  },

  JWT: {
    ACCESS_TOKEN: {
      SECRET: config.get<string>('ACCESS_SECRET'),
      EXPIRY: config.get<string>('ACCESS_EXPIRY_TIME'),
    },
    REFRESH_TOKEN: {
      SECRET: config.get<string>('REFRESH_SECRET'),
      EXPIRY: config.get<string>('REFRESH_EXPIRY_TIME'),
    },
  },
});

export const CONFIGURATION = configuration();

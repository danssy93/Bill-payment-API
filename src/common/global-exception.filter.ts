import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

import AppValidationError from './app-validation';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      'GLOBAL APPLICATION SLACK TRACE:',
      JSON.stringify(exception),
    );

    if (exception instanceof AppValidationError) {
      ResponseFormat.failure(
        response,
        exception.message,
        HttpStatus.BAD_REQUEST,
      );
    } else if (exception instanceof HttpException) {
      ResponseFormat.failure(
        response,
        exception.message,
        exception.getStatus?.() || HttpStatus.BAD_REQUEST,
      );
    } else if (
      exception.name?.toLowerCase() === 'jsonwebtokenerror' ||
      exception.name?.toLowerCase() === 'tokenexpirederror'
    ) {
      ResponseFormat.failure(
        response,
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    } else if (exception.name?.toLowerCase() === 'casterror') {
      ResponseFormat.failure(
        response,
        'Invalid input type',
        HttpStatus.BAD_REQUEST,
      );
    } else if (exception.status === 429) {
      ResponseFormat.failure(
        response,
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      ResponseFormat.failure(
        response,
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

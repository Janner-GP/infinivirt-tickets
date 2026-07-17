import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Manejo centralizado de errores: toda excepción (de negocio, de validación o
 * no controlada) termina aquí y se serializa con el mismo contrato de respuesta.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    if (!isHttpException) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message: this.extractMessage(exceptionResponse, exception),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private extractMessage(
    exceptionResponse: unknown,
    exception: unknown,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') return exceptionResponse;
    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      return (exceptionResponse as { message: string | string[] }).message;
    }
    return exception instanceof Error
      ? exception.message
      : 'Internal server error';
  }
}

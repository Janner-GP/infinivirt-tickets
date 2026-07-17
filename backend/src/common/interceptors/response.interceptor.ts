import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

/**
 * Respuestas consistentes: toda respuesta exitosa de la API se envuelve en el
 * mismo sobre { success, statusCode, data, timestamp }, sin que cada
 * controlador tenga que armarlo a mano.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => ({
        success: true as const,
        statusCode: response.statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

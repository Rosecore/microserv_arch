import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null && 'errors' in body) {
        response.status(status).send(body);
        return;
      }

      const message =
        typeof body === 'string'
          ? body
          : (body as any).message ?? exception.message;
      response.status(status).send({ errors: [{ message }] });
      return;
    }

    console.log(exception);
    response
      .status(HttpStatus.BAD_REQUEST)
      .send({ errors: [{ message: 'Something went wrong' }] });
  }
}

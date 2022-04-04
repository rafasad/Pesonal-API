import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { unlink } from 'fs/promises';
import { FileImage } from '../helpers/image-upload.helper';

@Injectable()
export class HttpFileException implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const body = context.switchToHttp().getRequest();

        let files = [];
        if (body.files) files = body.files;
        if (body.file) files.push(body.file);

        files.forEach(async (file) => {
          if ((<FileImage>file)?.path !== undefined) {
            try {
              await unlink(file?.path);
              console.log(
                `${new Date().toISOString()} (catchError) Intercept - Successfully deleted ${
                  file?.path
                }`,
              );
            } catch (error) {
              console.error(
                `${new Date().toISOString()} (catchError) Intercept - There was an error   ${
                  file?.path
                } -`,
                error.message,
              );
            }
          }
        });
        return throwError(err);
      }),
    );
  }
}

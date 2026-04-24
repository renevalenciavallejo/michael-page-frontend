import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = extractMessage(err);
      toast.error(message);
      return throwError(() => err);
    }),
  );
};

function extractMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'No se pudo contactar al servidor.';
  const body = err.error;
  if (typeof body === 'string' && body.trim()) return body;
  if (body?.message) return body.message;
  if (body?.title) return body.title;
  if (body?.details) return body.details;
  if (body?.validationErrors) {
    const firstKey = Object.keys(body.validationErrors)[0];
    const v = body.validationErrors[firstKey];
    if (Array.isArray(v) && v.length) return v[0];
  }
  if (body?.errors) {
    const firstKey = Object.keys(body.errors)[0];
    const v = body.errors[firstKey];
    if (Array.isArray(v) && v.length) return v[0];
  }
  return `Error ${err.status}: ${err.statusText || 'request failed'}`;
}

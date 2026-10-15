// Errores de la API. Todas las respuestas de error tienen la forma
// { "error": { "code": "...", "message": "...", "details"?: [{ "path", "message" }] } }.

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export type ErrorCode =
  | 'validation'
  | 'email_taken'
  | 'invalid_credentials'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'not_found'
  | 'internal';

/** Problema concreto de validación: `path` es la ruta del campo, p. ej. "events[3].line". */
export interface ErrorDetail {
  path: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: ErrorCode,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const unauthorized = () => new AppError(401, 'unauthorized', 'Not signed in');
export const notFound = (message = 'Not found') => new AppError(404, 'not_found', message);

export function validationError(details: ErrorDetail[]): AppError {
  const first = details[0];
  const message = first ? (first.path ? `${first.path}: ${first.message}` : first.message) : 'Invalid request';
  return new AppError(400, 'validation', message, details.slice(0, 20));
}

/** Valida `data` con un esquema de zod o lanza un error `validation` con cada problema. */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw validationError(result.error.issues.map((i) => ({ path: formatPath(i.path), message: i.message })));
  }
  return result.data;
}

export function formatPath(path: readonly PropertyKey[]): string {
  let out = '';
  for (const part of path) {
    if (typeof part === 'number') out += `[${part}]`;
    else out += out ? `.${String(part)}` : String(part);
  }
  return out;
}

export function sendError(reply: FastifyReply, error: AppError): FastifyReply {
  const body: { code: ErrorCode; message: string; details?: ErrorDetail[] } = { code: error.code, message: error.message };
  if (error.details?.length) body.details = error.details;
  return reply.code(error.statusCode).send({ error: body });
}

/** Manejador de errores de Fastify: traduce cualquier error al formato de la API. */
export function errorHandler(error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply): FastifyReply {
  if (error instanceof AppError) return sendError(reply, error);

  const status = typeof error.statusCode === 'number' && error.statusCode >= 400 ? error.statusCode : 500;
  if (status >= 500) {
    request.log.error({ err: error }, 'Error interno');
    return sendError(reply, new AppError(500, 'internal', 'Internal server error'));
  }
  // Errores de Fastify antes de llegar a la ruta: JSON mal formado, cuerpo demasiado
  // grande, tipo de contenido no admitido...
  const code: ErrorCode =
    status === 401 ? 'unauthorized' : status === 403 ? 'forbidden' : status === 404 ? 'not_found' : status === 429 ? 'rate_limited' : 'validation';
  return sendError(reply, new AppError(status, code, error.message));
}

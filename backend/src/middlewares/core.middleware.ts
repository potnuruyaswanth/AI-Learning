import { ApiMiddleware } from 'motia';
import { ZodError } from 'zod';
import { BaseError } from '../errors/base.error';

export const coreMiddleware: ApiMiddleware = async (req, ctx, next) => {
  const logger = ctx.logger;

  try {
    return await next();
  } catch (error: any) {
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      logger.error('Validation error', {
        error,
        stack: zodError.stack,
        issues: zodError.issues,
      });

      return {
        status: 400,
        body: {
          success: false,
          error: 'Validation error',
          details: zodError.issues,
        },
      };
    }

    if (error instanceof BaseError) {
      logger.error('Application error', {
        error: error.message,
        code: error.code,
        status: error.status,
      });

      return {
        status: error.status,
        body: {
          success: false,
          error: error.message,
          code: error.code,
        },
      };
    }

    logger.error('Unexpected error', {
      error: error.message,
      stack: error.stack,
    });

    return {
      status: 500,
      body: {
        success: false,
        error: 'Internal server error',
      },
    };
  }
};

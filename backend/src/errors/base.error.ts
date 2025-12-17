export class BaseError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly metadata: Record<string, any>;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    metadata: Record<string, any> = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.metadata = metadata;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        status: this.status,
        ...(Object.keys(this.metadata).length > 0 && { metadata: this.metadata }),
      },
    };
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Not Found', metadata: Record<string, any> = {}) {
    super(message, 404, 'NOT_FOUND', metadata);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Unauthorized', metadata: Record<string, any> = {}) {
    super(message, 401, 'UNAUTHORIZED', metadata);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string = 'Bad Request', metadata: Record<string, any> = {}) {
    super(message, 400, 'BAD_REQUEST', metadata);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string = 'Conflict', metadata: Record<string, any> = {}) {
    super(message, 409, 'CONFLICT', metadata);
  }
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request") {
    return new AppError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new AppError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, message);
  }

  static invalid(message = "Validation failed") {
    return new AppError(400, message);
  }

  static conflict(message= "Conflicting request"){
    return new AppError(409, message);
  }
}

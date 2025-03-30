class CustomError extends Error {
  statusCode: number;
  desc: string;
  constructor(message: string, statusCode: number = 500, desc: string) {
    super(message);
    this.statusCode = statusCode;
    this.desc = desc.length > 0 ? desc : message;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
/**
 * Custom error class for "Bad Request" errors (HTTP 400)
 * @class
 * @extends {CustomError}
 */
class BadRequestError extends CustomError {
  /**
   * Creates an instance of BadRequestError
   * @param message - sent back to client
   * @param desc - used for logging
   */
  constructor(message: string, desc: string = "") {
    super(message, 400, desc);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Custom error class for "Not Found" errors (HTTP 404)
 * @class
 * @extends {CustomError}
 */
class NotFoundError extends CustomError {
  /**
   * Creates an instance of NotFoundError
   * @param message - sent back to client
   * @param desc - used for logging
   */
  constructor(message: string, desc: string = "") {
    super(message, 404, desc);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Custom error class for "Unauthorized" errors (HTTP 401)
 * @class
 * @extends {CustomError}
 */
class UnauthorizedError extends CustomError {
  /**
   * Creates an instance of UnauthorizedError
   * @param message - sent back to client
   * @param desc - used for logging
   */
  constructor(message: string, desc: string = "") {
    super(message, 401, desc);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Custom error class for "Forbidden" errors (HTTP 403)
 * @class
 * @extends {CustomError}
 */
class ForbiddenError extends CustomError {
  /**
   * Creates an instance of ForbiddenError
   * @param message - sent back to client
   * @param desc - used for logging
   */
  constructor(message: string, desc: string = "") {
    super(message, 403, desc);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Custom error class for "Gateway Timeout" errors (HTTP 504)
 * @class
 * @extends {CustomError}
 */
class GatewayTimeoutError extends CustomError {
  /**
   * Creates an instance of GatewayTimeoutError
   * @param message - sent back to client
   * @param desc - used for logging
   */
  constructor(message: string, desc: string = "") {
    super(message, 504, desc);
    Object.setPrototypeOf(this, GatewayTimeoutError.prototype);
  }
}

export {
  CustomError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  GatewayTimeoutError,
};

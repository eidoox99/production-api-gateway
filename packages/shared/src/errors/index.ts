import createError from "http-errors";

export { createError };

export function unauthorized(message = "Unauthorized") {
  return createError(401, message);
}

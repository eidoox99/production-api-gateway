import type { Request, RequestHandler } from "express";
import {
  unauthorized,
  verifyToken,
  type JwtPayload,
} from "@production-grade-api-gateway/shared";

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}

export function createAuthMiddleware(secret: string): RequestHandler {
  return (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return next(unauthorized());
    }

    try {
      const token = authorization.slice(7);
      (req as RequestWithUser).user = verifyToken(token, secret);
      next();
    } catch {
      next(unauthorized("Invalid token"));
    }
  };
}

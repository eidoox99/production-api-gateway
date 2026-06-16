import jwt, { type SignOptions } from "jsonwebtoken";
import type { JwtPayload } from "../types/index.js";

export function signToken(
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions["expiresIn"] = "1h"
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}

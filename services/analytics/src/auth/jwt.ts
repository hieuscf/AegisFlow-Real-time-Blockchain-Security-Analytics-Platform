import jwt, { type SignOptions } from "jsonwebtoken";

import { loadConfig } from "../config/env";

export interface AuthTokenPayload {
  sub: string;
  address: string;
}

export function signSessionToken(address: string): string {
  const config = loadConfig();
  const payload: AuthTokenPayload = {
    sub: address.toLowerCase(),
    address,
  };

  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, config.jwt.secret, options);
}

export function verifySessionToken(token: string): AuthTokenPayload {
  const config = loadConfig();
  return jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
}

import jwt from "jsonwebtoken";

import { env } from "@/config/env";
import { tokensExpiryInSex } from "@/config/tokenExpiry";

interface TokenPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn:tokensExpiryInSex.ACCESS });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: tokensExpiryInSex.REFRESH,
  });
};

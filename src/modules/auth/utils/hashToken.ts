import crypto from "crypto";


// why are we hashing the refreshToken ?
// just in case the db is attacked teh refresh token is not spread
// Same idea as password hashing (but fast hash is fine here).
export const hashRefreshToken = (refreshToken: string) => {
  return crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
};
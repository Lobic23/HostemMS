import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, pwdHash: string) => {
  return bcrypt.compare(password, pwdHash);
};
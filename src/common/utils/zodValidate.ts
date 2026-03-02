import { AppError } from "../types/errors";
import {z} from "zod";

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((e) => e.message).join(", ");
    throw AppError.invalid(message);
  }
  return result.data;
}

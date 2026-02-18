import { UserDB } from "db";
export type UserResponse = Omit<UserDB, "password">;

// A DTO aka Data transfer object is basically a response / request type
// generally request
// not to be confused with entity which is a db type or model or schema
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

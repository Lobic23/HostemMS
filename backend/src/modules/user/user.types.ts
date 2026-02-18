// A DTO aka Data transfer object is basically a response / request type
// generally request
// not to be confused with entity which is a db type or model or schema 
export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  status: "ACTIVE" | "SUSPENDED";
};

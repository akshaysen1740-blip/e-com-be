// user.service.ts

import { AppError } from "../../utills/AppErrors";
import { createUser, getUserByEmail } from "./user.modal";
import bcrypt from "bcrypt";

const salt_rounds = process.env.SALT_ROUNDS || 10;
export const registerUser = async (
  email: string,
  userName: string,
  password: string,
  role : string
) => {
  const user = await getUserByEmail(email);
  if (user) {
    throw new AppError("Email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return await createUser(email, userName, hashedPassword , role);
};

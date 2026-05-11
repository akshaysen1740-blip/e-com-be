import pool from "../../config/db";
import { Userresponse } from "../../types/user.types";

export const createUser = async (
  email: string,
  userName: string,
  password: string,
  role : string
) => {
  const [result] = await pool.query(
    `INSERT INTO users (email , password , userName , role) VALUES (? , ? , ?, ?)`,
    [email, password, userName , role],
  );
  return result;
};

export const getUserByEmail = async (email : string) : Promise<Userresponse | null> => {
  const [rows] = await pool.query(
    `SELECT * FROM users Where email = (?)`,
    email
  )
  const users = rows as Userresponse[];
  return users.length > 0 ? users[0] : null;
}

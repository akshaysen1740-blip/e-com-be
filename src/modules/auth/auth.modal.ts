import pool from "../../config/db";
import { AppError } from "../../utills/AppErrors";

export const saveRefreshToken = async (
  refreshToken: string,
  userId: number,
) => {
  const [result] = await pool.query(
    `INSERT INTO refresh_tokens (user_id , token , is_revoked) VALUES (? , ? , ?)`,
    [userId, refreshToken, false],
  );

  return result;
};

export const revokeToken = async (token: string) => {
  console.log(token, "token");
  const [result]: any = await pool.query(
    "UPDATE refresh_tokens SET is_revoked = TRUE WHERE token = ? AND is_revoked = FALSE",
    [token],
  );

  console.log(result, ">>>>>>");
  if (result.affectedRows === 0) {
    throw new AppError("Token already revoked or not found", 400);
  }

  return true;
};

export const findToken = async (token: string) => {
  const [rows]: any[] = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token = ? `,
    token,
  );
  return rows[0];
};

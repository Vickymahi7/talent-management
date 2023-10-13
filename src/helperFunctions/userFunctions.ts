import bcrypt from "bcrypt";
import User from "../models/userModel";
import db from '../database/dbConnection';
import { HttpConflict } from "../utils/errors";

export const createUser = async (user: User, connection?: any): Promise<any> => {
  if (!connection) connection = await db.getConnection();
  const isEmailExists = await checkUserExists(user.email_id!);
  if (isEmailExists) {
    throw new HttpConflict("User already exists for this email");
  } else {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password!, salt);
    user = { ...user, password: hashedPassword };
    return await connection.query(
      "INSERT INTO user (tenant_id,user_type_id,user_name,password,email_id,user_status_id,active,created_by_id,created_dt,last_updated_dt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [user.tenant_id, user.user_type_id, user.user_name, user.password, user.email_id, user.user_status_id, user.active, user.created_by_id, new Date(), new Date()]
    );
  }
}

export const checkUserExists = async (emailId: string, connection?: any): Promise<boolean> => {
  if (!connection) connection = await db.getConnection();
  const existingUsers = await connection.query("SELECT * FROM user WHERE email_id = ?", [emailId]);
  return Array.isArray(existingUsers[0]) && existingUsers[0].length > 0;
}
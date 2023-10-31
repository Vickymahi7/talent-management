import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import User from "../models/User";
import { db } from '../data-source';
import { HttpConflict } from "../utils/errors";
import { EntityManager } from "typeorm";
dotenv.config();

export const generateAccessToken = (userData: any) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;

  return jwt.sign({ ...userData }, accessTokenSecret, { expiresIn: 60 * 30 });
}

export const createUser = async (user: User, dbConnection?: EntityManager): Promise<any> => {
  if (!dbConnection) dbConnection = db;
  const existingUser = await db.findOne(User, { where: { email_id: user.email_id } });
  if (existingUser) {
    throw new HttpConflict("User already exists for this email");
  } else {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password!, salt);

    user.password = hashedPassword;
    user.active = true;

    return await dbConnection.save(User, user);
  }
}
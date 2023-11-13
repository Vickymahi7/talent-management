import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";
import { AppDataSource } from "../data-source";
import { HttpConflict } from "../types/errors";
import { EntityManager } from "typeorm";
import { sendMail } from "../utils/nodemail";
import { TM_ACTIVATION_URL } from "../utils/constants";
dotenv.config();
const db = AppDataSource.manager;

export const generateAccessToken = (userData: any) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign({ ...userData }, accessTokenSecret, { expiresIn: 60 * 30 });
};

export const createUser = async (
  user: User,
  dbConnection?: EntityManager
): Promise<any> => {
  if (!dbConnection) dbConnection = db;
  const existingUser = await db.findOne(User, {
    where: { email_id: user.email_id },
  });
  if (existingUser) {
    throw new HttpConflict("User already exists for this email");
  } else {
    const token = uuidv4();
    user.active = false;
    user.activation_token = token;

    await dbConnection.save(User, user);

    const activationUrl = generateActivationUrl(user.activation_token);

    const mailOptions = {
      from: process.env.NODE_MAIL_EMAIL_ID,
      to: user.email_id,
      subject: "User Activation Mail",
      html: `<p>Hi ${user.user_name},</p><p>Welcome to Talent Management.<br>Please click on <a href="${activationUrl}">this link</a> to activate your account</p><p>Sincerely,<br>Talent Management Team</p>`,
    };

    // Send the email
    const mailRes = sendMail(mailOptions);
  }
};

export function generateActivationUrl(token: string) {
  return process.env.WEB_APP_BASE_URL + TM_ACTIVATION_URL + token;
}

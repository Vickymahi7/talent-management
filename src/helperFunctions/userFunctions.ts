import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";
import { AppDataSource } from "../data-source";
import { HttpConflict } from "../types/errors";
import { EntityManager } from "typeorm";
import { sendMail } from "../utils/nodemailer";
import { TM_ACTIVATION_URL } from "../utils/constants";
import { AccountStatusId } from "../types/enums";
dotenv.config();
const db = AppDataSource.manager;

export const generateAccessToken = (userData: any) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign({ ...userData }, accessTokenSecret, { expiresIn: "1d" });
};

export const createUser = async (
  reqBody: any,
  dbConnection?: EntityManager
): Promise<any> => {
  try {
    if (!dbConnection) dbConnection = db;
    const existingUser = await db.findOne(User, {
      where: { email_id: reqBody.email_id },
    });
    if (existingUser) {
      throw new HttpConflict("User already exists for this email");
    } else {
      const token = uuidv4();

      const userResponse = await dbConnection.save(User, {
        tenant_id: reqBody.tenant_id == "" ? undefined : reqBody.tenant_id,
        user_type_id:
          reqBody.user_type_id == "" ? undefined : reqBody.user_type_id,
        user_name: reqBody.user_name,
        email_id: reqBody.email_id,
        phone: reqBody.phone,
        activation_token: token,
        user_status_id: AccountStatusId.IN_Active,
        active: false,
        created_by_id:
          reqBody.created_by_id == "" ? undefined : reqBody.created_by_id,
      });

      const activationUrl = generateActivationUrl(token);

      await sendUserActivationMail(
        reqBody.email_id!,
        reqBody.user_name!,
        activationUrl
      );

      return userResponse;
    }
  } catch (error) {
    throw error;
  }
};

export async function sendUserActivationMail(
  emailId: string,
  userName: string,
  activationUrl: string
) {
  const mailOptions = {
    from: process.env.NODE_MAIL_EMAIL_ID,
    to: emailId,
    subject: "User Activation Mail",
    html: `<p>Hi ${userName},</p><p>Welcome to Talent Management.<br>Please click on <a href="${activationUrl}">this link</a> to activate your account</p><p>Sincerely,<br>Talent Management Team</p>`,
  };

  // Send the email
  const mailRes = await sendMail(mailOptions);
  console.log(mailRes);
  return mailRes;
}

export function generateActivationUrl(token: string) {
  return process.env.WEB_APP_BASE_URL + TM_ACTIVATION_URL + token;
}

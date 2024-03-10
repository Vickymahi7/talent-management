import { HttpStatusCode } from "axios";
import base64url from "base64-url";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { EntityManager, Not } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../data-source";
import { AccountStatusId, UserTypes } from "../enums/enums";
import StandardMenu from "../models/StandardMenu";
import User from "../models/User";
import UserMenuPrivilege from "../models/UserMenuPrivilege";
import { HttpConflict } from "../types/errors";
import {
  TM_ACTIVATION_URL,
  TM_INVITE_REGISTRATION_URL,
  TM_RESET_PASSWORD_URL,
} from "../utils/constants";
import { sendMail } from "../utils/nodemailer";
dotenv.config();
const db = AppDataSource.manager;

export const generateAccessToken = (userData: any) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign({ ...userData }, accessTokenSecret, { expiresIn: "1d" });
};

export const createUser = async (
  reqBody: any,
  res: any,
  dbConnection?: EntityManager
): Promise<any> => {
  try {
    if (!dbConnection) dbConnection = db;
    const existingUser = await db.findOne(User, {
      where: { email_id: reqBody.email_id },
    });
    if (existingUser) {
      // throw new HttpConflict("User already exists for this email");
      return res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Conflict,
        message: "User already exists for this email",
      });
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
        user_status_id: AccountStatusId.INACTIVE,
        active: false,
        created_by_id:
          reqBody.created_by_id == "" ? undefined : reqBody.created_by_id,
        created_dt: new Date().toISOString(),
        last_updated_dt: new Date().toISOString(),
      });

      await assignDefaultMenuPrivileges(dbConnection, userResponse);

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

export const invitedUserRegistration = async (
  reqBody: any,
  res: any,
  dbConnection?: EntityManager
): Promise<any> => {
  try {
    if (!dbConnection) dbConnection = db;
    const existingUser = await db.findOne(User, {
      where: { email_id: reqBody.email_id },
    });
    if (existingUser) {
      return res.status(HttpStatusCode.Ok).json({
        status: HttpStatusCode.Conflict,
        message: "User already exists for this email",
      });
    } else {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(reqBody.password!, salt);

      const userResponse = await dbConnection.save(User, {
        tenant_id: reqBody.tenant_id,
        user_type_id: UserTypes.USR,
        user_name: reqBody.user_name,
        email_id: reqBody.email_id,
        password: hashedPassword,
        phone: reqBody.phone,
        user_status_id: AccountStatusId.ACTIVE,
        active: true,
        created_by_id: reqBody.created_by_id,
        created_dt: new Date().toISOString(),
        last_updated_dt: new Date().toISOString(),
      });

      await assignDefaultMenuPrivileges(dbConnection, userResponse);

      // const activationUrl = generateActivationUrl(token);

      // await sendUserActivationMail(
      //   reqBody.email_id!,
      //   reqBody.user_name!,
      //   activationUrl
      // );

      return userResponse;
    }
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (dbConnection: any, userData: any) => {
  let isEmailChange = false;

  const existingUser = await db.findOne(User, {
    where: { user_id: userData.user_id },
  });

  const response = await dbConnection.update(User, userData.user_id, {
    user_type_id: userData.user_type_id,
    user_name: userData.user_name,
    // email_id: userData.email_id,
    phone: userData.phone,
    photo_url: userData.photo_url,
    // activation_token: userData.activation_token,
    active: userData.active,
    user_status_id: userData.user_status_id,
    last_updated_dt: new Date().toISOString(),
  });

  if (
    userData.hasOwnProperty("user_type_id") &&
    existingUser?.user_type_id != userData.user_type_id
  ) {
    userData.tenant_id = existingUser?.tenant_id;
    await assignDefaultMenuPrivileges(dbConnection, userData);
  }

  if (
    userData.hasOwnProperty("email_id") &&
    existingUser?.email_id != userData.email_id
  ) {
    isEmailChange = await handleUserEmailChange(
      dbConnection,
      userData.user_id,
      userData.email_id
    );
  }

  return { response, isEmailChange };
};

export const handleUserEmailChange = async (
  dbConnection: any,
  userId: number,
  emailId: string
) => {
  let isEmailChange = false;
  const user = await dbConnection.findOne(User, {
    where: { user_id: userId },
  });

  const isEmailExists = await dbConnection.findOne(User, {
    where: { email_id: emailId, user_id: Not(userId) },
  });
  if (isEmailExists) {
    throw new HttpConflict("User already exists for this email");
  } else {
    if (user?.email_id != emailId) {
      const token = uuidv4();

      // update email_id
      const response = await dbConnection.update(User, userId, {
        email_id: emailId,
        activation_token: token,
        active: false,
        last_updated_dt: new Date().toISOString(),
      });

      isEmailChange = true;
      const activationUrl = generateActivationUrl(token);

      // send activation mail
      await sendUserActivationMail(
        user!.email_id!,
        user!.user_name!,
        activationUrl
      );
    }
  }
  return isEmailChange;
};

async function assignDefaultMenuPrivileges(
  dbConnection: EntityManager,
  user: User
) {
  // Select default Menu based on User Type
  const standardMenuList = await getStandardMenuByUserType(
    dbConnection,
    user.user_type_id!
  );

  const delResponse = await dbConnection.delete(UserMenuPrivilege, {
    user_id: user.user_id,
  });

  for (const standardMenu of standardMenuList) {
    const response = await dbConnection.save(UserMenuPrivilege, {
      tenant_id: user.tenant_id,
      user_id: user.user_id,
      standard_menu_id: standardMenu.standard_menu_id,
      menu_order: standardMenu.menu_order,
      active: true,
      created_dt: new Date().toISOString(),
      last_updated_dt: new Date().toISOString(),
    });
  }
}

export async function sendUserActivationMail(
  emailId: string,
  userName: string,
  activationUrl: string
) {
  const mailOptions = {
    from: process.env.NODE_MAIL_EMAIL_ID,
    to: emailId,
    subject: "User Activation Mail",
    html: `<p>Hi ${userName},</p><p>Welcome to Talent Management.<br>Please click on <a href="${activationUrl}">this link</a> to activate your account</p><p>Regards,<br>Talent Management Team</p>`,
  };

  // Send the email
  const mailRes = await sendMail(mailOptions);
  return mailRes;
}

export async function sendPasswordResetMail(
  tenantId: number,
  emailId: string,
  userName: string
) {
  const encodedString = encodeResetPasswordData(tenantId, emailId);

  const generatedUrl = generateResetPasswordUrl(encodedString);

  const mailOptions = {
    from: process.env.NODE_MAIL_EMAIL_ID,
    to: emailId,
    subject: "Password Reset Mail",
    html: `<p>Hi ${userName},</p>
    <p>We received a request to reset the password for your account. To reset your password, please click the following link:</p>
    <p><a href="${generatedUrl}">Reset Password</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Regards,<br>Talent Management Team</p>`,
  };

  // Send the email
  const mailRes = await sendMail(mailOptions);
  return mailRes;
}

export function generateActivationUrl(token: string) {
  return process.env.WEB_APP_BASE_URL + TM_ACTIVATION_URL + token;
}

export function generateInviteRegistrationUrl(encodedString: string) {
  return (
    process.env.WEB_APP_BASE_URL + TM_INVITE_REGISTRATION_URL + encodedString
  );
}

export function encodeInviteUserData(userData: any) {
  // Encode values like TenantId-InvitedUserId-UserName-UserEamil
  // use - as separator
  return base64url.encode(
    `${userData.tenantId}-${userData.createdById}-${userData.displayName}-${userData.mail}`
  );
}

export function generateResetPasswordUrl(encodedString: string) {
  return process.env.WEB_APP_BASE_URL + TM_RESET_PASSWORD_URL + encodedString;
}

export function encodeResetPasswordData(tenantId: number, emailId: string) {
  // Encode values like TenantId-UserEamil
  // use - as separator
  return base64url.encode(`${tenantId}-${emailId}`);
}

export function decodeInviteUserData(encodedString: string) {
  // Decoded values will be like TenantId-InvitedUserId-UserName-UserEamil
  const decodedValues = base64url.decode(encodedString);

  // remove separator - and return the values array
  const valuesArray = decodedValues.split("-");

  return valuesArray.length == 4 ? valuesArray : [];
}

export function decodeResetPasswordData(encodedString: string) {
  // Decoded values will be like TenantId-UserEamil
  const decodedValues = base64url.decode(encodedString);

  // remove separator - and return the values array
  const valuesArray = decodedValues.split("-");

  return valuesArray.length == 2 ? valuesArray : [];
}

async function getStandardMenuByUserType(
  db: EntityManager,
  userTypeId: number
) {
  let standardMenuList = [] as StandardMenu[];
  if (userTypeId == UserTypes.SAD) {
    standardMenuList = await db.find(StandardMenu, {
      where: { sad: true, active: true },
    });
  } else if (userTypeId == UserTypes.PUS) {
    standardMenuList = await db.find(StandardMenu, {
      where: { is_tenant_menu: true, adm: true, active: true },
    });
  } else if (userTypeId == UserTypes.HRU) {
    standardMenuList = await db.find(StandardMenu, {
      where: { is_tenant_menu: true, hru: true, active: true },
    });
  } else {
    standardMenuList = await db.find(StandardMenu, {
      where: { is_tenant_menu: true, usr: true, active: true },
    });
  }
  return standardMenuList;
}

import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { DeleteResult, InsertResult, Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { AccountStatusId, HttpStatusCode } from "../enums/enums";
import { sendUserInvitationMail } from "../helperFunctions/mailHelperFunctions";
import {
  createUser,
  decodeInviteUserData,
  decodeResetPasswordData,
  generateAccessToken,
  generateActivationUrl,
  invitedUserRegistration,
  sendPasswordResetMail,
  sendUserActivationMail,
  updateUser,
} from "../helperFunctions/userFunctions";
import Tenant from "../models/Tenant";
import User from "../models/User";
import UserMenuPrivilege from "../models/UserMenuPrivilege";
import {
  HttpBadRequest,
  HttpConflict,
  HttpNotFound,
  HttpUnauthorized,
} from "../types/errors";
import { uploadFile } from "../utils/s3";
import {
  validateAddUserInput,
  validateLoginInput,
  validatePhotoUpload,
  validateUpdateUserInput,
} from "../validations/validations";
dotenv.config();

const db = AppDataSource.manager;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: APIs for Managing Users
 * /login:
 *   post:
 *     summary: User Login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_id:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email_id
 *               - password
 *             example:
 *               email_id: superadmin@demo.com
 *               password: demo123
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 userId:
 *                   type: number
 *                 userTypeId:
 *                   type: number
 *                 userName:
 *                   type: string
 *                 tenantLogo:
 *                   type: string
 *                 photoUrl:
 *                   type: string
 */
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email_id, password } = req.body;
    validateLoginInput(email_id, password);

    const user = await db.findOne(User, {
      where: { email_id: email_id },
    });
    const tenant = await db.findOne(Tenant, {
      where: { tenant_id: user?.tenant_id },
    });

    const isActiveUser = user?.user_status_id == AccountStatusId.ACTIVE;
    const isActiveTenant = tenant?.tenant_status_id == AccountStatusId.ACTIVE;

    if (user) {
      if (!user.active || !isActiveUser || !isActiveTenant) {
        throw new HttpUnauthorized("User Inactive");
      }
      const isPaswordMatched = await bcrypt.compare(password, user.password!);
      if (isPaswordMatched) {
        const userData = {
          user_id: user.user_id,
          user_type_id: user.user_type_id,
          tenant_id: user.tenant_id,
        };

        const accessToken = generateAccessToken(userData);

        const responseData = {
          userId: user.user_id,
          accessToken,
          userTypeId: user.user_type_id,
          userName: user.user_name,
          tenantLogo: tenant.logo_url,
          photo_url: user.photo_url,
          isPrimaryUser: user.user_id == tenant.user_id,
        };
        return res.status(HttpStatusCode.OK).json({ ...responseData });
      }
    }
    throw new HttpUnauthorized("Invalid Credentials");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/add:
 *   post:
 *     summary: Add New User
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_type_id:
 *                 type: number
 *               user_name:
 *                 type: string
 *               email_id:
 *                 type: string
 *               phone:
 *                 type: string
 *               user_status_id:
 *                 type: number
 *             required:
 *               - user_name
 *               - email_id
 *               - password
 *             example:
 *               user_type_id: 3
 *               user_name: Demo User
 *               email_id: demouser@demo.com
 *               phone: 9876543210
 *               user_status_id: null
 *     responses:
 *       201:
 *         description: Created.
 */
export const userAdd = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers.tenantId?.toString();
    req.body.tenant_id = parseInt(tenantId!);

    validateAddUserInput(req.body);

    const response = await createUser(req.body);

    res.status(HttpStatusCode.CREATED).json({
      status: HttpStatusCode.CREATED,
      message: "User Created",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/inviteduser/register:
 *   post:
 *     summary: Invited User Registration
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_type_id:
 *                 type: number
 *               user_name:
 *                 type: string
 *               email_id:
 *                 type: string
 *               phone:
 *                 type: string
 *               user_status_id:
 *                 type: number
 *             required:
 *               - user_name
 *               - email_id
 *               - password
 *             example:
 *               user_type_id: 3
 *               user_name: Demo User
 *               email_id: demouser@demo.com
 *               phone: 9876543210
 *               user_status_id: null
 *     responses:
 *       201:
 *         description: Created.
 */
export const registerInvitedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const tenantId = req.headers.tenantId?.toString();
    // req.body.tenant_id = parseInt(tenantId!);

    validateAddUserInput(req.body);

    const response = await invitedUserRegistration(req.body);

    res.status(HttpStatusCode.CREATED).json({
      status: HttpStatusCode.CREATED,
      message: "User Created",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * tags:
 *   name: User Activation
 *   description: APIs for Managing User Activation
 * /user/activationdetail:
 *   get:
 *     summary: Get User Details by activation token
 *     tags: [User Activation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: token
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const getUserActivationDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.params.token;
    if (!token) {
      throw new HttpNotFound("Bad Request");
    } else {
      const user = await db.findOne(User, {
        select: { user_id: true, email_id: true, active: true },
        where: { activation_token: token },
      });
      if (user) {
        res.status(HttpStatusCode.OK).json({ user });
      } else {
        throw new HttpNotFound("Bad Request");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/activate:
 *   patch:
 *     summary: Activates New User
 *     tags: [User Activation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               email_id:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - user_id
 *               - email_id
 *               - password
 *             example:
 *               user_id: 1
 *               email_id: demouser@demo.com
 *               password: demo123
 *     responses:
 *       200:
 *         description: OK.
 */
export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: User = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(user.password!, salt);

    const response = await db.update(User, user.user_id, {
      password: hashedPassword,
      active: true,
      user_status_id: AccountStatusId.ACTIVE,
      activation_token: "",
    });

    if (response.affected && response.affected > 0) {
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "User Activated",
      });
    } else {
      throw new HttpNotFound("User not found");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/resendactivation:
 *   post:
 *     summary: Resend User Activation Mail
 *     tags: [User Activation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: OK.
 */
export const resendActivationMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new HttpBadRequest("User Id is required");
    } else {
      const user = await db.findOne(User, {
        select: {
          user_id: true,
          email_id: true,
          user_name: true,
          activation_token: true,
        },
        where: { user_id: parseInt(userId) },
      });
      if (user) {
        if (user.activation_token) {
          const activationUrl = generateActivationUrl(user.activation_token);
          const sendMailResponse = await sendUserActivationMail(
            user.email_id!,
            user.user_name!,
            activationUrl
          );
          res.status(HttpStatusCode.OK).json({
            status: HttpStatusCode.OK,
            message: `Activation Mail has been sent to ${user.email_id}`,
          });
        } else {
          throw new HttpBadRequest("Bad Request");
        }
      } else {
        throw new HttpNotFound("User not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/list:
 *   get:
 *     summary: List all Users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK.
 */
export const getUserList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers.tenantId as string;
    const userList = await db.find(User, {
      select: {
        user_id: true,
        tenant_id: true,
        user_type_id: true,
        user_name: true,
        email_id: true,
        phone: true,
        photo_url: true,
        user_status_id: true,
        active: true,
        created_by_id: true,
        last_access: true,
        created_dt: true,
        last_updated_dt: true,
      },
      where: { tenant_id: parseInt(tenantId) },
      order: { user_id: "ASC" },
    });
    res.status(HttpStatusCode.OK).json({ userList });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/update:
 *   patch:
 *     summary: Update User Details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               user_type_id:
 *                 type: number
 *               user_name:
 *                 type: string
 *               email_id:
 *                 type: string
 *               phone:
 *                 type: string
 *               photo_url:
 *                 type: string
 *               user_status_id:
 *                 type: string
 *               active:
 *                 type: boolean
 *             required:
 *               - user_id
 *               - user_name
 *               - email_id
 *             example:
 *               user_id: 1
 *               user_type_id: null
 *               user_name: Demo User
 *               email_id: demouser@demo.com
 *               phone: 9876543210
 *               user_status_id: null
 *     responses:
 *       200:
 *         description: OK.
 */
export const userUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reqBody = req.body;

    validateUpdateUserInput(reqBody);

    const isEmailExists = await db.findOne(User, {
      where: { email_id: reqBody.email_id, user_id: Not(reqBody.user_id!) },
    });
    if (isEmailExists) {
      throw new HttpConflict("User already exists for this email");
    } else {
      const response = await updateUser(db, reqBody);
      if (response.affected && response.affected > 0) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "User Updated",
        });
      } else {
        throw new HttpNotFound("User not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/view/{id}:
 *   get:
 *     summary: Get User Details by User Id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: OK.
 */
export const userView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new HttpBadRequest("User Id is required");
    } else {
      const user = await db.findOne(User, {
        select: {
          user_id: true,
          tenant_id: true,
          user_type_id: true,
          user_name: true,
          email_id: true,
          phone: true,
          photo_url: true,
          user_status_id: true,
          active: true,
          created_by_id: true,
          last_access: true,
          created_dt: true,
          last_updated_dt: true,
        },
        where: { user_id: parseInt(userId) },
      });
      if (user) {
        res.status(HttpStatusCode.OK).json({ user });
      } else {
        throw new HttpNotFound("User not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     summary: Delete a User by User Id
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: OK.
 */
export const userDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      throw new HttpBadRequest("User Id is required");
    } else {
      const response = await db.delete(User, userId);
      if (response.affected && response.affected > 0) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "User Deleted",
        });
      } else {
        throw new HttpNotFound("User not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/userprofile:
 *   get:
 *     summary: Get User Profile Details for currently Logged In user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK.
 */
export const getUserProfileDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.headers.userId?.toString();
    if (!currentUserId) {
      throw new HttpBadRequest("Bad Request");
    } else {
      const user = await db.findOne(User, {
        select: {
          user_id: true,
          user_type_id: true,
          user_name: true,
          email_id: true,
          phone: true,
          photo_url: true,
        },
        where: { user_id: parseInt(currentUserId) },
      });
      if (user) {
        res.status(HttpStatusCode.OK).json({ user });
      } else {
        throw new HttpNotFound("User not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/updatepassword:
 *   patch:
 *     summary: Update User Password
 *     tags: [User Activation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email_id:
 *                 type: string
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *             required:
 *               - email_id
 *               - password
 *               - token
 *             example:
 *               email_id: demouser@demo.com
 *               password: demo123
 *               token:
 *     responses:
 *       200:
 *         description: OK.
 */
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email_id, password } = req.body;

    const user = await db.findOne(User, {
      where: { email_id: email_id },
    });

    if (user) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password!, salt);

      const response = await db.update(User, user.user_id, {
        password: hashedPassword,
      });

      if (response.affected && response.affected > 0) {
        return res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "Password Updated",
        });
      }
    }
    throw new HttpNotFound("User not found");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/changepassword:
 *   patch:
 *     summary: Change Existing Password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               password:
 *                 type: string
 *               existing_password:
 *                 type: string
 *             required:
 *               - user_id
 *               - password
 *               - existing_password
 *             example:
 *               user_id: demouser@demo.com
 *               password: demo123
 *               existing_password: demo123
 *     responses:
 *       200:
 *         description: OK.
 */
export const changeExistingPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id, password, existing_password } = req.body;

    const user = await db.findOne(User, {
      where: { user_id: user_id },
    });

    if (user) {
      const isPaswordMatched = await bcrypt.compare(
        existing_password,
        user.password!
      );

      if (isPaswordMatched) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password!, salt);

        const response = await db.update(User, user.user_id, {
          password: hashedPassword,
        });

        if (response.affected && response.affected > 0) {
          return res.status(HttpStatusCode.OK).json({
            status: HttpStatusCode.OK,
            message: "Password Updated",
          });
        }
      } else {
        throw new HttpUnauthorized("Incorrect password. Please Try again");
      }
    }
    throw new HttpNotFound("User not found");
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/aduserinvite:
 *   post:
 *     summary: Invite AD Users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *             example:
 *               users:
 *                 - displayName: John Doe
 *                   mail: test@test.com
 *     responses:
 *       201:
 *         description: Created.
 */
export const inviteAdUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.headers.userId?.toString();
    const tenantId = req.headers.tenantId?.toString();
    const { users } = req.body;

    const sendMailResponse = await sendUserInvitationMail(
      users,
      tenantId!,
      currentUserId!
    );

    console.log(sendMailResponse);

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Invitation Mail Sent Successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/inviteduser/decode:
 *   get:
 *     summary: Decode Invited User Details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: key
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const getInvitedUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.body;
    if (!key) {
      throw new HttpNotFound("Bad Request");
    } else {
      // Decode the values like TenantId-InvitedUserId-UserName-UserEamil
      const decodedValues = decodeInviteUserData(key);

      if (decodedValues.length > 0) {
        const [tenant_id, created_by_id, user_name, email_id] = decodedValues;

        const userData = { tenant_id, created_by_id, user_name, email_id };

        res.status(HttpStatusCode.OK).json({ user: userData });
      } else {
        throw new HttpNotFound("Bad Request");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/forgotpassword:
 *   post:
 *     summary: Invite AD Users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *             example:
 *               users:
 *                 - displayName: John Doe
 *                   mail: test@test.com
 *     responses:
 *       201:
 *         description: Created.
 */
export const sendForgotPasswordMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email_id } = req.body;

    const user = await db.findOne(User, {
      where: { email_id: email_id },
    });

    if (user) {
      const sendMailResponse = await sendPasswordResetMail(
        user.tenant_id!,
        email_id,
        user.user_name!
      );

      console.log(sendMailResponse);

      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: `Password Reset Mail has been sent to ${email_id}`,
      });
    } else {
      throw new HttpUnauthorized("Invalid Credentials");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/resetpassword/decode:
 *   get:
 *     summary: Decode Invited User Details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: key
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const decodeResetPasswordDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { key } = req.params;
    if (!key) {
      throw new HttpNotFound("Bad Request");
    } else {
      // Decode the values like TenantId-InvitedUserId-UserName-UserEamil
      const decodedValues = decodeResetPasswordData(key);

      if (decodedValues.length > 0) {
        const [tenant_id, email_id] = decodedValues;

        const userData = { email_id };

        res.status(HttpStatusCode.OK).json({ user: userData });
      } else {
        throw new HttpNotFound("Bad Request");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /standardprivilege/list:
 *   get:
 *     summary: List Standard User Privileges
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const getStandardPrivileges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers.tenantId as string;
    const userId = req.params.userId as string;
    const nativeQuery = `SELECT stm.standard_menu_id, stm.main_menu_id,stm.main_menu, stm.menu, stm.web_url, stm.icon,
    stm.menu_order,ump.user_menu_privilege_id, ump.tenant_id, ump.user_id, IF(ump.active=1, 1, 0) as active 
    FROM standard_menu stm 
    LEFT JOIN user_menu_privilege ump ON ump.standard_menu_id = stm.standard_menu_id AND ump.tenant_id = ? AND ump.user_id = ? 
    WHERE stm.active=1 AND (stm.adm=1 OR stm.hru=1 OR stm.usr=1)`;

    let standardPrivilegeList = await db.query(nativeQuery, [
      parseInt(tenantId),
      parseInt(userId),
    ]);

    standardPrivilegeList = standardPrivilegeList.map((data) => {
      // convert 1 or 0 from string to Boolean
      data.active = Boolean(parseInt(data.active));
      return data;
    }) as UserMenuPrivilege[];

    res.status(HttpStatusCode.OK).json({ standardPrivilegeList });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /usermenuprivilege/list:
 *   get:
 *     summary: List User Privileges
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK.
 */
export const getUserMenuPrivileges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers.tenantId as string;
    const userId = req.headers.userId as string;
    const nativeQuery = `SELECT ump.user_menu_privilege_id, ump.tenant_id, ump.user_id, ump.standard_menu_id, 
        ump.active, stm.main_menu_id,stm.main_menu, stm.menu, stm.web_url, stm.icon, stm.menu_order 
        FROM user_menu_privilege ump 
        LEFT JOIN standard_menu stm ON stm.standard_menu_id = ump.standard_menu_id 
        WHERE ump.tenant_id = ? AND ump.user_id = ? AND ump.active = 1`;

    const userMenuPrivilegeList = (await db.query(nativeQuery, [
      parseInt(tenantId),
      parseInt(userId),
    ])) as UserMenuPrivilege[];
    res.status(HttpStatusCode.OK).json({ userMenuPrivilegeList });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /usermenuprivilege/statechange:
 *   get:
 *     summary: Active / Inactive User Menu
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_menu_privilege_id:
 *                 type: number
 *               active:
 *                 type: number
 *             example:
 *               userMenuPrivilege:
 *                 - user_menu_privilege_id: 1
 *                 - active: 1
 *     responses:
 *       200:
 *         description: OK.
 */
export const userMenuPrivilegeStateChange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers.tenantId as string;
    const reqBody = req.body;

    const userMenuPrivilegeData = {
      tenant_id: parseInt(tenantId),
      user_id: reqBody.user_id,
      standard_menu_id: reqBody.standard_menu_id,
      menu_order: reqBody.menu_order,
      active: reqBody.active,
      last_updated_dt: reqBody.last_updated_dt,
      created_dt: reqBody.created_dt,
    } as UserMenuPrivilege;

    let response = null as InsertResult | DeleteResult | null;

    if (reqBody.active) {
      const response = await db.insert(UserMenuPrivilege, {
        tenant_id: parseInt(tenantId),
        user_id: reqBody.user_id,
        standard_menu_id: reqBody.standard_menu_id,
        menu_order: reqBody.menu_order,
        active: reqBody.active,
        last_updated_dt: reqBody.last_updated_dt,
        created_dt: reqBody.created_dt,
      });
      if (response.raw?.affectedRows && response.raw.affectedRows > 0) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "User Privilege Updated",
        });
      } else {
        throw new HttpBadRequest("User Privilege cannot be updated");
      }
    } else {
      const response = await db.delete(
        UserMenuPrivilege,
        reqBody.user_menu_privilege_id
      );

      if (response.affected && response.affected > 0) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "User Privilege Removed",
        });
      } else {
        throw new HttpNotFound("User Privilege not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /user/photoupload:
 *   post:
 *     summary: Upload User Profile Photo
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - id
 *               - file
 *     responses:
 *       200:
 *         description: Ok.
 *     x-swagger-router-controller: "Default"
 */
export const userProfilePhotoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.body.id;
    const file = req.file;
    validatePhotoUpload(req);

    const fileBuffer = file?.buffer;
    const uploadLocation = process.env.AWS_USER_PROFILE_PIC_PATH + userId;
    const fileUrl = `${process.env.AWS_SAVE_URL!}/${uploadLocation}`;

    const uploadRes = await uploadFile(
      fileBuffer,
      uploadLocation,
      file?.mimetype
    );

    const userData = {
      user_id: userId,
      photo_url: fileUrl,
    };

    const response = await updateUser(db, userData);

    if (response.affected && response.affected > 0) {
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Photo Uploaded",
      });
    } else {
      throw new HttpNotFound("User not found");
    }
  } catch (error) {
    next(error);
  }
};

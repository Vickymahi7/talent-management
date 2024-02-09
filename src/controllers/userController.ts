import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { AccountStatusId, HttpStatusCode, UserTypes } from "../enums/enums";
import { getPaginationData } from "../helperFunctions/commonFunctions";
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
  HttpInternalServerError,
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
      if (user.user_type_id != UserTypes.SAD && !isActiveTenant) {
        throw new HttpUnauthorized("Tenant Account Deactivated");
      } else if (!isActiveUser) {
        throw new HttpUnauthorized("User Account Deactivated");
      } else if (!user.active) {
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
          tenantLogo: tenant?.logo_url,
          photo_url: user.photo_url,
          isPrimaryUser: user.user_id == tenant?.user_id,
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

    await db.transaction(async (transactionalEntityManager) => {
      const response = await createUser(
        req.body,
        res,
        transactionalEntityManager
      );

      if (response.user_id) {
        res.status(HttpStatusCode.CREATED).json({
          status: HttpStatusCode.CREATED,
          message: "User Created",
        });
      }
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

    await db.transaction(async (transactionalEntityManager) => {
      const response = await invitedUserRegistration(
        req.body,
        transactionalEntityManager
      );

      if (response.user_id) {
        res.status(HttpStatusCode.CREATED).json({
          status: HttpStatusCode.CREATED,
          message: "User Created",
        });
      }
    });
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
    let { lastRecordKey, perPage } = getPaginationData(req.query);
    const tenantId = req.headers.tenantId as string;
    const userTypeId = req.headers.userTypeId as string;

    let superAdminCondition = "";
    superAdminCondition =
      parseInt(userTypeId) == UserTypes.SAD
        ? ` AND usr.user_type_id = ${userTypeId}`
        : ` AND usr.tenant_id = ${tenantId}`;

    const nativeQuery = `SELECT usr.user_id, usr.tenant_id,usr.user_type_id,usr.user_name,
      usr.email_id,usr.phone,usr.photo_url,usr.user_status_id,usr.active,usr.created_by_id,
      usr.last_access,usr.created_dt,usr.last_updated_dt
      FROM user usr
      WHERE usr.user_id > ? ${superAdminCondition}
      ORDER BY usr.user_id ASC ${perPage ? `LIMIT ${perPage}` : ""}`;

    const userList = (await db.query(nativeQuery, [lastRecordKey!])) as User[];

    lastRecordKey =
      userList.length > 0 ? userList[userList.length - 1].user_id! : null;

    res.status(HttpStatusCode.OK).json({ lastRecordKey, userList });
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
    let isEmailChange = false;
    const reqBody = req.body;
    const userId = req.body.user_id?.toString();

    validateUpdateUserInput(reqBody);

    let response: any = null;

    // handling transaction
    await db.transaction(async (transactionalEntityManager) => {
      const updateResponse = await updateUser(
        transactionalEntityManager,
        reqBody
      );

      response = updateResponse.response;
      isEmailChange = updateResponse.isEmailChange;
    });

    if (response && response.affected && response.affected > 0) {
      if (isEmailChange) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: `User Updated. Activation Mail has been sent to ${reqBody.email_id}`,
        });
      } else {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "User Updated",
        });
      }
    } else {
      throw new HttpNotFound("User not found");
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
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.NOT_FOUND,
        message: "Invalid Activation Link",
      });
    } else {
      const user = await db.findOne(User, {
        select: { user_id: true, email_id: true, active: true },
        where: { activation_token: token },
      });
      if (user) {
        res.status(HttpStatusCode.OK).json({ user });
      } else {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.NOT_FOUND,
          message: "Invalid Activation Link",
        });
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

    let newUsers: any[] = [];
    let hasExistingUser = false;

    for (const item of users) {
      console.log(item.mail)
      const existingUser = await db.findOne(User, {
        where: { email_id: item.mail },
      });
      // console.log(existingUser)
      if (existingUser) {
        hasExistingUser = true;
      } else {
        newUsers.push(item);
      }
    }

    const sendMailResponse = await sendUserInvitationMail(
      newUsers,
      tenantId!,
      currentUserId!
    );

    if (hasExistingUser && newUsers.length == 0 && sendMailResponse) {
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.CONFLICT,
        message: "Selected Users already exists",
      });
    } else if (hasExistingUser && sendMailResponse) {
      return res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.CONFLICT,
        message:
          "One or More Users already exists. Invitation Mail has been Sent to others",
      });
    } else if(sendMailResponse) {
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Invitation Mail Sent Successfully",
      });
    }
    else {
      throw new HttpInternalServerError("Something went wrong!");
    }
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
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: `Password Reset Mail has been sent to ${email_id}`,
      });
    } else {
      throw new HttpUnauthorized("User Not Found");
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
 * /user/photoupload:
 *   post:
 *     summary: Upload User Profile Photo
 *     tags: [Users]
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

    const { response } = await updateUser(db, userData);

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

/**
 * @swagger
 * tags:
 *   name: User Menu Privileges
 *   description: APIs for Managing User Menu Privileges
 * /standardprivilege/list:
 *   get:
 *     summary: List Standard User Privileges
 *     tags: [User Menu Privileges]
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

    const user = await db.findOne(User, {
      where: { user_id: parseInt(userId) },
    });

    const userTypeId = user?.user_type_id;

    let defaultUserType = "";
    if (userTypeId == UserTypes.SAD) {
      defaultUserType = "stm.sad";
    } else if (userTypeId == UserTypes.PUS) {
      defaultUserType = "stm.adm";
    } else if (userTypeId == UserTypes.USR) {
      defaultUserType = "stm.usr";
    }

    let userCondition = "";
    if (userTypeId == UserTypes.SAD) {
      userCondition = "";
    } else {
      userCondition = "AND stm.is_tenant_menu=1";
    }

    const nativeQuery = `SELECT stm.standard_menu_id, stm.main_menu_id,stm.main_menu, stm.menu, stm.web_url, stm.icon,${defaultUserType} as is_default,
    stm.is_tenant_menu,stm.menu_order,ump.user_menu_privilege_id, ump.tenant_id, ump.user_id, IF(ump.active=1, 1, 0) as active 
    FROM standard_menu stm 
    LEFT JOIN user_menu_privilege ump ON ump.standard_menu_id = stm.standard_menu_id AND ump.tenant_id = ? AND ump.user_id = ? 
    WHERE stm.active=1 ${userCondition}`;

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
 *     tags: [User Menu Privileges]
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
    const userTypeId = req.headers.userTypeId as string;
    let includeTenantId = "";
    includeTenantId =
      parseInt(userTypeId) == UserTypes.SAD
        ? ""
        : ` AND ump.tenant_id = ${tenantId}`;

    const nativeQuery = `SELECT ump.user_menu_privilege_id, ump.tenant_id, ump.user_id, ump.standard_menu_id, 
        ump.active, stm.main_menu_id,stm.main_menu, stm.menu, stm.web_url, stm.icon,stm.is_tenant_menu, stm.menu_order 
        FROM user_menu_privilege ump 
        LEFT JOIN standard_menu stm ON stm.standard_menu_id = ump.standard_menu_id 
        WHERE ump.user_id = ? AND ump.active = 1 ${includeTenantId}`;

    const userMenuPrivilegeList = (await db.query(nativeQuery, [
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
 *     tags: [User Menu Privileges]
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
 * /usermenuprivilege/routecheck:
 *   get:
 *     summary: List User Privileges
 *     tags: [User Menu Privileges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: routeName
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const canUserAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const routeName = req.query.routeName as string;
    const tenantId = req.headers.tenantId as string;
    const userTypeId = req.headers.userTypeId as string;
    const userId = req.headers.userId as string;

    let includeTenantId = "";
    includeTenantId =
      parseInt(userTypeId) == UserTypes.SAD
        ? ""
        : ` AND ump.tenant_id = ${tenantId}`;

    const nativeQuery = `SELECT EXISTS (SELECT ump.user_menu_privilege_id 
        FROM user_menu_privilege ump 
        LEFT JOIN standard_menu stm ON stm.standard_menu_id = ump.standard_menu_id 
        WHERE ump.user_id = ? AND ump.active = 1 AND stm.web_url = ? ${includeTenantId}) as result`;

    const [{ result }] = await db.query(nativeQuery, [
      parseInt(userId),
      routeName,
    ]);
    res
      .status(HttpStatusCode.OK)
      .json({ result: result === "1" ? true : false });
  } catch (error) {
    next(error);
  }
};

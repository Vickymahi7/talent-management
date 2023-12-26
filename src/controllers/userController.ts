import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { AccountStatusId, HttpStatusCode } from "../enums/enums";
import { sendUserInvitationMail } from "../helperFunctions/mailHelperFunctions";
import {
  createUser,
  decodeInviteUserData,
  generateAccessToken,
  generateActivationUrl,
  invitedUserRegistration,
  sendUserActivationMail,
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
import {
  validateAddUserInput,
  validateLoginInput,
  validateUpdateUserInput,
} from "../validations/validations";

dotenv.config();

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
 */
export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email_id, password } = req.body;
    validateLoginInput(email_id, password);

    const user = await AppDataSource.manager.findOne(User, {
      where: { email_id: email_id },
    });
    const tenant = await AppDataSource.manager.findOne(Tenant, {
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
      message: "User Created Successfully",
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
      message: "User Created Successfully",
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
      const user = await AppDataSource.manager.findOne(User, {
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

    const response = await AppDataSource.manager.update(User, user.user_id, {
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
    let userId = req.params.id;
    if (!userId) {
      throw new HttpBadRequest("User Id is required");
    } else {
      const user = await AppDataSource.manager.findOne(User, {
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
            message: "Activation Mail Sent",
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
    const userList = await AppDataSource.manager.find(User, {
      // relations: ["user_menu_privilege"],
      // select: {
      //   user_id: true,
      //   tenant_id: true,
      //   user_type_id: true,
      //   user_name: true,
      //   email_id: true,
      //   phone: true,
      //   user_status_id: true,
      //   active: true,
      //   created_by_id: true,
      //   last_access: true,
      //   created_dt: true,
      //   last_updated_dt: true,

      //   user_menu_privilege: {
      //     user_menu_privilege_id: true,
      //     tenant_id: true,
      //     user_id: true,
      //     standard_menu_id: true,
      //     menu_order: true,
      //     active: true,
      //     last_updated_dt: true,
      //     created_dt: true,
      //   },
      // },
      where: { tenant_id: parseInt(tenantId) },
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

    const isEmailExists = await AppDataSource.manager.findOne(User, {
      where: { email_id: reqBody.email_id, user_id: Not(reqBody.user_id!) },
    });
    if (isEmailExists) {
      throw new HttpConflict("User already exists for this email");
    } else {
      const response = await AppDataSource.manager.update(
        User,
        reqBody.user_id,
        {
          user_type_id: reqBody.user_type_id,
          user_name: reqBody.user_name,
          email_id: reqBody.email_id,
          phone: reqBody.phone,
          user_status_id: reqBody.user_status_id,
          last_updated_dt: reqBody.last_updated_dt,
        }
      );

      if (response.affected && response.affected > 0) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "User Updated Successfully",
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
    let userId = req.params.id;
    if (!userId) {
      throw new HttpBadRequest("User Id is required");
    } else {
      const user = await AppDataSource.manager.findOne(User, {
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
    let userId = req.params.id;
    if (!userId) {
      throw new HttpBadRequest("User Id is required");
    } else {
      const response = await AppDataSource.manager.delete(User, userId);
      if (response.affected && response.affected > 0) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "User Deleted Successfully",
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
      message: "Mail Sent Successfully",
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
 * /usermenuprivilege/list:
 *   get:
 *     summary: List User Privileges
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
export const getUserMenuPrivileges = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers.tenantId as string;
    const userId = req.params.userId as string;
    const nativeQuery = `SELECT ump.user_menu_privilege_id, ump.tenant_id, ump.user_id, ump.standard_menu_id, 
        ump.active, stm.main_menu_id,stm.main_menu, stm.menu, stm.web_url, stm.icon, stm.menu_order 
        FROM user_menu_privilege ump 
        LEFT JOIN standard_menu stm ON stm.standard_menu_id = ump.standard_menu_id 
        WHERE tenant_id = ? AND user_id = ?`;

    let userMenuPrivilegeList = (await AppDataSource.manager.query(
      nativeQuery,
      [parseInt(tenantId), parseInt(userId)]
    )) as UserMenuPrivilege[];
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
    const reqBody = req.body;

    const response = await AppDataSource.manager.update(
      UserMenuPrivilege,
      reqBody.user_menu_privilege_id,
      {
        active: reqBody.active ? true : false,
      }
    );

    if (response.affected && response.affected > 0) {
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "User Privilege Updated Successfully",
      });
    } else {
      throw new HttpNotFound("User Privilege not found");
    }
  } catch (error) {
    next(error);
  }
};

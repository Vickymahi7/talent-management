import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { Not } from "typeorm";
import { AppDataSource } from "../data-source";
import User from "../models/User";
import {
  HttpBadRequest,
  HttpConflict,
  HttpNotFound,
  HttpUnauthorized,
} from "../types/errors";
import HttpStatusCode from "../types/httpStatusCode";
import {
  validateAddUserInput,
  validateLoginInput,
  validateUpdateUserInput,
} from "../validations/validations";
import {
  createUser,
  generateAccessToken,
} from "../helperFunctions/userFunctions";

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
    if (user) {
      const isPaswordMatched = await bcrypt.compare(password, user.password!);
      if (isPaswordMatched) {
        const userData = {
          user_id: user.user_id,
          user_type_id: user.user_type_id,
          tenant_id: user.tenant_id,
        };

        const accessToken = generateAccessToken(userData);

        return res
          .status(HttpStatusCode.OK)
          .json({ accessToken, userTypeId: user.user_type_id });
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
    let user: User = req.body;
    user.tenant_id = parseInt(tenantId!);

    validateAddUserInput(user);

    const response = await createUser(user);

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
 *   put:
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
      activation_token: null,
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
 *   put:
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
 *               user_status_id: null
 *               active: true
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
    const user: User = req.body;

    validateUpdateUserInput(user);

    const isEmailExists = await db.findOne(User, {
      where: { email_id: user.email_id, user_id: Not(user.user_id!) },
    });
    if (isEmailExists) {
      throw new HttpConflict("User already exists for this email");
    } else {
      const response = await db.update(User, user.user_id, {
        user_type_id: user.user_type_id,
        user_name: user.user_name,
        email_id: user.email_id,
        user_status_id: user.user_status_id,
        active: user.active,
      });

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
      const user = await db.findOne(User, {
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
      const response = await db.delete(User, userId);
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

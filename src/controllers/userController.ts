import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { Not } from "typeorm";
import { db } from "../data-source";
import User from "../models/User";
import {
  HttpBadRequest,
  HttpConflict,
  HttpNotFound,
  HttpUnauthorized,
} from "../utils/errors";
import HttpStatusCode from "../utils/httpStatusCode";
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
const userLogin = async (req: Request, res: Response, next: NextFunction) => {
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
 *               password:
 *                 type: string
 *               email_id:
 *                 type: string
 *               user_status_id:
 *                 type: number
 *               active:
 *                 type: boolean
 *             required:
 *               - user_name
 *               - email_id
 *               - password
 *             example:
 *               user_type_id: 3
 *               user_name: Demo User
 *               password: demo123
 *               email_id: demouser@demo.com
 *               user_status_id: null
 *               active: true
 *     responses:
 *       201:
 *         description: Created.
 */
const userAdd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers.tenantId?.toString();
    let user: User = req.body;
    user.tenant_id = parseInt(tenantId!);

    validateAddUserInput(user);

    const response = await createUser(user);

    res
      .status(HttpStatusCode.CREATED)
      .json({ message: "User Created Successfully" });
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
const getUserList = async (req: Request, res: Response, next: NextFunction) => {
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
const userUpdate = async (req: Request, res: Response, next: NextFunction) => {
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
        res
          .status(HttpStatusCode.OK)
          .json({ message: "User Updated Successfully" });
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
const userView = async (req: Request, res: Response, next: NextFunction) => {
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
const userDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let userId = req.params.id;
    if (!userId) {
      throw new HttpBadRequest("User Id is required");
    } else {
      const response = await db.delete(User, userId);
      if (response.affected && response.affected > 0) {
        res
          .status(HttpStatusCode.OK)
          .json({ message: "User Deleted Successfully" });
      } else {
        throw new HttpNotFound("User not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

export { userLogin, getUserList, userAdd, userDelete, userUpdate, userView };

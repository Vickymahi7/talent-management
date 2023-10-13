import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ResultSetHeader } from 'mysql2';
import db from '../database/dbConnection';
import User from '../models/userModel';
import { HttpBadRequest, HttpConflict, HttpNotFound, HttpUnauthorized } from '../utils/errors';
import HttpStatusCode from '../utils/httpStatusCode';
import { validateAddUserInput, validateLoginInput, validateUpdateUserInput } from '../validations/validations';
import { createUser } from '../helperFunctions/userFunctions';

config();

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
 *               email_id: demouser@demo.com
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

    const [existingUsers] = await db.query("SELECT user_id,tenant_id,password FROM user WHERE email_id = ?", [email_id]);
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      const user: User = existingUsers[0] as User;
      const isPaswordMatched = await bcrypt.compare(password, user.password!);
      if (isPaswordMatched) {
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!
        const accessToken = jwt.sign({ user_id: user.user_id, tenant_id: user.tenant_id }, accessTokenSecret, { expiresIn: 60 * 30 });

        return res.status(HttpStatusCode.OK).json({ accessToken: accessToken });
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
 *               tenant_id:
 *                 type: number
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
 *               - tenant_id
 *               - user_name
 *               - email_id
 *               - password
 *             example:
 *               tenant_id: 1
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
    let user: User = req.body;
    validateAddUserInput(user);

    const response = await createUser(user);
    const resHeader = response[0] as ResultSetHeader;

    res.status(HttpStatusCode.CREATED).json({ message: "User Created Successfully" });
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
    const tenantId = req.headers.tenantId;

    const [userList] = await db.query("SELECT * FROM user WHERE tenant_id = ?", [tenantId]);
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

    const [existingUsers] = await db.query("SELECT * FROM user WHERE user_id = ?", [user.user_id]);
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      const existingUser: User = existingUsers[0] as User;

      if (existingUser.email_id != user.email_id) {

        const [existingEamil] = await db.query("SELECT * FROM user WHERE email_id = ? And user_id != ?", [user.email_id, user.user_id]);
        if (Array.isArray(existingEamil) && existingEamil.length > 0) {
          throw new HttpConflict("User already exists for this email");
        }
      }
      const response = await db.query(
        "UPDATE user SET user_type_id=?,user_name=?,email_id=?,user_status_id=?,active=?,last_updated_dt=? Where user_id = ?",
        [user.user_type_id, user.user_name, user.email_id, user.user_status_id, user.active, new Date(), user.user_id]
      );

      res.status(HttpStatusCode.OK).json({ message: "User Updated Successfully" });
    }
    else {
      throw new HttpNotFound("User Not Found");
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
    }
    else {
      const [userList] = await db.query("SELECT * FROM user WHERE user_id = ?", (userId));
      const user: User = userList[0];
      if (user) {
        res.status(HttpStatusCode.OK).json({ user });
      }
      else {
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
    }
    else {
      const [response] = await db.query("Delete FROM user WHERE user_id = ?", (userId));
      const resHeader = response as ResultSetHeader;
      if (resHeader.affectedRows > 0) {
        res.status(HttpStatusCode.OK).json({ message: "User Deleted Successfully" });
      }
      else {
        throw new HttpNotFound("User not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

export { getUserList, userAdd, userDelete, userLogin, userUpdate, userView };


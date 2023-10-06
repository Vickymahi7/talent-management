import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { HttpConflict, HttpBadRequest, HttpNotFound, HttpUnauthorized } from '../utils/errors';
import HttpStatusCode from '../constants/HttpStatusCode';
import { validateLoginInput, validateAddUserInput, validateUpdateUserInput } from '../validations/validations';
import userListData from '../models/userList.json';
import { config } from 'dotenv';

config();

let userList: any[] = userListData;
let userIdCount = 1;

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
    validateLoginInput(req);

    let userData = userList.find((data) => data.email_id == email_id);
    if (userData) {
      const isPaswordMatched = await bcrypt.compare(password, userData.password);
      if (isPaswordMatched) {
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!
        const accessToken = jwt.sign({ user_id: userData.user_id }, accessTokenSecret, { expiresIn: 60 * 30 });

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
 * /signup:
 *   post:
 *     summary: Add New User Account
 *     tags: [Users]
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
 *               created_by_id:
 *                 type: number
 *               status_id:
 *                 type: string
 *               active:
 *                 type: boolean
 *               last_access:
 *                 type: string
 *               created_dt:
 *                 type: string
 *               last_updated_dt:
 *                 type: string
 *             required:
 *               - user_name
 *               - email_id
 *               - password
 *             example:
 *               user_type_id: null
 *               user_name: Demo User
 *               password: demo123
 *               email_id: demouser@demo.com
 *               created_by_id: null
 *               status_id: null
 *               active: true
 *     responses:
 *       201:
 *         description: Created.
 */
const userAdd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateAddUserInput(req);
    const isUserExists = userList.some((item) => item.email_id === req.body.email_id);
    if (isUserExists) {
      throw new HttpConflict("User already exists for this email");
    } else {
      userIdCount++;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      let user = { ...req.body, user_id: userIdCount, password: hashedPassword };
      userList.push(user);

      res.status(HttpStatusCode.CREATED).json({ message: "User Created Successfully" });
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
const getUserList = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
 *               password:
 *                 type: string
 *               email_id:
 *                 type: string
 *               created_by_id:
 *                 type: number
 *               status_id:
 *                 type: string
 *               active:
 *                 type: boolean
 *               last_access:
 *                 type: string
 *               created_dt:
 *                 type: string
 *               last_updated_dt:
 *                 type: string
 *             required:
 *               - user_id
 *               - user_name
 *               - email_id
 *             example:
 *               user_id: 1
 *               user_type_id: null
 *               user_name: Demo User
 *               email_id: demouser@demo.com
 *               created_by_id: null
 *               status_id: null
 *               active: true
 *     responses:
 *       200:
 *         description: OK.
 */
const userUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateUpdateUserInput(req);
    const { password, ...userData } = req.body;

    const userIndex = userList.findIndex((data) => data.user_id == req.body.user_id);

    if (userIndex !== -1) {
      userList[userIndex] = { ...userList[userIndex], ...userData };

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
      const user = userList.find((data) => data.user_id == userId);
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
      const userIndex = userList.findIndex((data) => data.user_id == userId);
      if (userIndex !== -1) {
        userList.splice(userIndex, 1);

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

export {
  getUserList,
  userLogin,
  userAdd,
  userUpdate,
  userView,
  userDelete,
};

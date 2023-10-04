const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require("express-validator");
let userList = require("../models/userList.json");
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
const userLogin = async (req, res, next) => {
  try {
    let user = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, message: errors.array()[0].msg });
    } else {
      if (userList.length > 0 && user.email_id) {
        let userData = userList.find((data) => data.email_id == user.email_id);
        if (userData && userData.email_id) {
          const isPaswordMatched = await bcrypt.compare(
            user.password,
            userData.password
          );
          if (isPaswordMatched) {
            const accessToken = jwt.sign(
              { user_id: userData.user_id },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: 60 * 30 }
            );
            return res.status(200).json({ accessToken: accessToken });
          }
        }
      }
      res.status(401).json({ message: "Incorrect Email ID / Password" });
    }
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
const userAdd = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, message: errors.array()[0].msg });
    } else {
      userIdCount++;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      let user = {
        ...req.body,
        user_id: userIdCount,
        password: hashedPassword,
      };
      userList.push(user);

      res.status(201).json({ message: "User Created Successfully" });
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
const getUserList = async (req, res, next) => {
  try {
    res.status(200).json({ userList });
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
const userUpdate = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    let user = rest;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: 400, message: errors.array()[0].msg });
    } else {
      let userData = userList.find((data) => data.user_id == user.user_id);
      if (userData && userData.user_id) {
        userList = userList.map((data) => {
          if (data.user_id == user.user_id) {
            data = { ...data, ...user };
          }
          return data;
        });
        return res.status(200).json({ message: "User Updated Successfully" });
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
const userView = async (req, res, next) => {
  try {
    let userId = req.params.id;
    if (userList.length > 0 && userId) {
      const user = userList.find((data) => data.user_id == userId);
      if (user && user.user_id) {
        return res.status(200).json({ user });
      }
    }
    res.status(404).json({ message: "User not found" });
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
const userDelete = async (req, res, next) => {
  let userId = req.params.id;
  try {
    if (userList.length > 0 && userId) {
      let userData = userList.find((data) => data.user_id == userId);
      if (userData && userData.user_id) {
        userList = userList.filter((data) => data.user_id != userId);
        return res.status(200).json({ message: "User Deleted Successfully" });
      }
    }
    res.status(404).json({ message: "User not found" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserList,
  userLogin,
  userAdd,
  userUpdate,
  userView,
  userDelete,
};

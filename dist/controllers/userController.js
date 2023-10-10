"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDelete = exports.userView = exports.userUpdate = exports.userAdd = exports.userLogin = exports.getUserList = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const httpStatusCode_1 = __importDefault(require("../utils/httpStatusCode"));
const validations_1 = require("../validations/validations");
const mysqlDatabase_1 = __importDefault(require("../database/mysqlDatabase"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
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
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_id, password } = req.body;
        (0, validations_1.validateLoginInput)(req);
        const [existingUsers] = yield mysqlDatabase_1.default.query("SELECT * FROM user WHERE email_id = ?", [email_id]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            const user = existingUsers[0];
            const isPaswordMatched = yield bcrypt_1.default.compare(password, user.password);
            if (isPaswordMatched) {
                const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jsonwebtoken_1.default.sign({ user_id: user.user_id }, accessTokenSecret, { expiresIn: 60 * 30 });
                return res.status(httpStatusCode_1.default.OK).json({ accessToken: accessToken });
            }
        }
        throw new errors_1.HttpUnauthorized("Invalid Credentials");
    }
    catch (error) {
        next(error);
    }
});
exports.userLogin = userLogin;
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
const userAdd = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validations_1.validateAddUserInput)(req);
        const [existingUsers] = yield mysqlDatabase_1.default.query("SELECT * FROM user WHERE email_id = ?", [req.body.email_id]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            throw new errors_1.HttpConflict("User already exists for this email");
        }
        else {
            const salt = yield bcrypt_1.default.genSalt();
            const hashedPassword = yield bcrypt_1.default.hash(req.body.password, salt);
            const user = Object.assign(Object.assign({}, req.body), { password: hashedPassword });
            const response = yield mysqlDatabase_1.default.query("INSERT INTO user (organization_id,user_type_id,user_name,password,email_id,authtoken,user_status_id,active,created_by_id,created_dt,last_access,last_updated_dt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [user.organization_id, user.user_type_id, user.user_name, user.password, user.email_id, user.authtoken, user.user_status_id, user.active, user.created_by_id, new Date(), user.last_access, user.last_updated_dt]);
            res.status(httpStatusCode_1.default.CREATED).json({ message: "User Created Successfully" });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.userAdd = userAdd;
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
const getUserList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [userList] = yield mysqlDatabase_1.default.query("SELECT * FROM user");
        res.status(httpStatusCode_1.default.OK).json({ userList });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserList = getUserList;
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
const userUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validations_1.validateUpdateUserInput)(req);
        const user = req.body;
        const [existingUsers] = yield mysqlDatabase_1.default.query("SELECT * FROM user WHERE user_id = ?", [user.user_id]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.email_id != user.email_id) {
                const [existingEamil] = yield mysqlDatabase_1.default.query("SELECT * FROM user WHERE email_id = ? And user_id != ?", [user.email_id, user.user_id]);
                if (Array.isArray(existingEamil) && existingEamil.length > 0) {
                    throw new errors_1.HttpConflict("User already exists for this email");
                }
            }
            const response = yield mysqlDatabase_1.default.query("UPDATE user SET organization_id=?,user_type_id=?,user_name=?,email_id=?,authtoken=?,user_status_id=?,active=?,last_updated_dt=? Where user_id = ?", [user.organization_id, user.user_type_id, user.user_name, user.email_id, user.authtoken, user.user_status_id, user.active, new Date(), user.user_id]);
            res.status(httpStatusCode_1.default.OK).json({ message: "User Updated Successfully" });
        }
        else {
            throw new errors_1.HttpNotFound("User Not Found");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.userUpdate = userUpdate;
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
const userView = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId = req.params.id;
        if (!userId) {
            throw new errors_1.HttpBadRequest("User Id is required");
        }
        else {
            const [userList] = yield mysqlDatabase_1.default.query("SELECT * FROM user WHERE user_id = ?", (userId));
            const user = userList[0];
            if (user) {
                res.status(httpStatusCode_1.default.OK).json({ user });
            }
            else {
                throw new errors_1.HttpNotFound("User not found");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.userView = userView;
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
const userDelete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId = req.params.id;
        if (!userId) {
            throw new errors_1.HttpBadRequest("User Id is required");
        }
        else {
            const [response] = yield mysqlDatabase_1.default.query("Delete FROM user WHERE user_id = ?", (userId));
            const resHeader = response;
            if (resHeader.affectedRows > 0) {
                res.status(httpStatusCode_1.default.OK).json({ message: "User Deleted Successfully" });
            }
            else {
                throw new errors_1.HttpNotFound("User not found");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.userDelete = userDelete;

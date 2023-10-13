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
exports.userView = exports.userUpdate = exports.userLogin = exports.userDelete = exports.userAdd = exports.getUserList = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = require("dotenv");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbConnection_1 = __importDefault(require("../database/dbConnection"));
const errors_1 = require("../utils/errors");
const httpStatusCode_1 = __importDefault(require("../utils/httpStatusCode"));
const validations_1 = require("../validations/validations");
const userFunctions_1 = require("../helperFunctions/userFunctions");
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
        (0, validations_1.validateLoginInput)(email_id, password);
        const [existingUsers] = yield dbConnection_1.default.query("SELECT user_id,tenant_id,password FROM user WHERE email_id = ?", [email_id]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            const user = existingUsers[0];
            const isPaswordMatched = yield bcrypt_1.default.compare(password, user.password);
            if (isPaswordMatched) {
                const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jsonwebtoken_1.default.sign({ user_id: user.user_id, tenant_id: user.tenant_id }, accessTokenSecret, { expiresIn: 60 * 30 });
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
const userAdd = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = req.body;
        (0, validations_1.validateAddUserInput)(user);
        const response = yield (0, userFunctions_1.createUser)(user);
        const resHeader = response[0];
        res.status(httpStatusCode_1.default.CREATED).json({ message: "User Created Successfully" });
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
        const tenantId = req.headers.tenantId;
        const [userList] = yield dbConnection_1.default.query("SELECT * FROM user WHERE tenant_id = ?", [tenantId]);
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
const userUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        (0, validations_1.validateUpdateUserInput)(user);
        const [existingUsers] = yield dbConnection_1.default.query("SELECT * FROM user WHERE user_id = ?", [user.user_id]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.email_id != user.email_id) {
                const [existingEamil] = yield dbConnection_1.default.query("SELECT * FROM user WHERE email_id = ? And user_id != ?", [user.email_id, user.user_id]);
                if (Array.isArray(existingEamil) && existingEamil.length > 0) {
                    throw new errors_1.HttpConflict("User already exists for this email");
                }
            }
            const response = yield dbConnection_1.default.query("UPDATE user SET user_type_id=?,user_name=?,email_id=?,user_status_id=?,active=?,last_updated_dt=? Where user_id = ?", [user.user_type_id, user.user_name, user.email_id, user.user_status_id, user.active, new Date(), user.user_id]);
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
            const [userList] = yield dbConnection_1.default.query("SELECT * FROM user WHERE user_id = ?", (userId));
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
            const [response] = yield dbConnection_1.default.query("Delete FROM user WHERE user_id = ?", (userId));
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

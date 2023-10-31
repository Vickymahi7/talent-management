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
exports.userView = exports.userUpdate = exports.userDelete = exports.userAdd = exports.getUserList = exports.userLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const data_source_1 = require("../data-source");
const User_1 = __importDefault(require("../models/User"));
const errors_1 = require("../utils/errors");
const httpStatusCode_1 = __importDefault(require("../utils/httpStatusCode"));
const validations_1 = require("../validations/validations");
const userFunctions_1 = require("../helperFunctions/userFunctions");
dotenv_1.default.config();
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
const userLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_id, password } = req.body;
        (0, validations_1.validateLoginInput)(email_id, password);
        const user = yield data_source_1.db.findOne(User_1.default, {
            where: { email_id: email_id },
        });
        if (user) {
            const isPaswordMatched = yield bcrypt_1.default.compare(password, user.password);
            if (isPaswordMatched) {
                const userData = {
                    user_id: user.user_id,
                    user_type_id: user.user_type_id,
                    tenant_id: user.tenant_id
                };
                const accessToken = (0, userFunctions_1.generateAccessToken)(userData);
                return res.status(httpStatusCode_1.default.OK).json({ accessToken });
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
const userAdd = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const tenantId = (_a = req.headers.tenantId) === null || _a === void 0 ? void 0 : _a.toString();
        let user = req.body;
        user.tenant_id = parseInt(tenantId);
        (0, validations_1.validateAddUserInput)(user);
        const response = yield (0, userFunctions_1.createUser)(user);
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
        const userList = yield data_source_1.db.find(User_1.default, {
            where: { tenant_id: parseInt(tenantId) },
        });
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
        const isEmailExists = yield data_source_1.db.findOne(User_1.default, {
            where: { email_id: user.email_id, user_id: (0, typeorm_1.Not)(user.user_id) },
        });
        if (isEmailExists) {
            throw new errors_1.HttpConflict("User already exists for this email");
        }
        else {
            const response = yield data_source_1.db.update(User_1.default, user.user_id, {
                user_type_id: user.user_type_id,
                user_name: user.user_name,
                email_id: user.email_id,
                user_status_id: user.user_status_id,
                active: user.active,
            });
            if (response.affected && response.affected > 0) {
                res.status(httpStatusCode_1.default.OK).json({ message: "User Updated Successfully" });
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
            const user = yield data_source_1.db.findOne(User_1.default, {
                where: { user_id: parseInt(userId) },
            });
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
            const response = yield data_source_1.db.delete(User_1.default, userId);
            if (response.affected && response.affected > 0) {
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

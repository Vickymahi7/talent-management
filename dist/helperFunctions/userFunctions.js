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
exports.checkUserExists = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbConnection_1 = __importDefault(require("../database/dbConnection"));
const errors_1 = require("../utils/errors");
const createUser = (user, connection) => __awaiter(void 0, void 0, void 0, function* () {
    if (!connection)
        connection = yield dbConnection_1.default.getConnection();
    const isEmailExists = yield (0, exports.checkUserExists)(user.email_id);
    if (isEmailExists) {
        throw new errors_1.HttpConflict("User already exists for this email");
    }
    else {
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPassword = yield bcrypt_1.default.hash(user.password, salt);
        user = Object.assign(Object.assign({}, user), { password: hashedPassword });
        return yield connection.query("INSERT INTO user (tenant_id,user_type_id,user_name,password,email_id,user_status_id,active,created_by_id,created_dt,last_updated_dt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [user.tenant_id, user.user_type_id, user.user_name, user.password, user.email_id, user.user_status_id, user.active, user.created_by_id, new Date(), new Date()]);
    }
});
exports.createUser = createUser;
const checkUserExists = (emailId, connection) => __awaiter(void 0, void 0, void 0, function* () {
    if (!connection)
        connection = yield dbConnection_1.default.getConnection();
    const existingUsers = yield connection.query("SELECT * FROM user WHERE email_id = ?", [emailId]);
    return Array.isArray(existingUsers[0]) && existingUsers[0].length > 0;
});
exports.checkUserExists = checkUserExists;

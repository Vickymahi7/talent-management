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
exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const data_source_1 = require("../data-source");
const errors_1 = require("../utils/errors");
const createUser = (user, dbConnection) => __awaiter(void 0, void 0, void 0, function* () {
    if (!dbConnection)
        dbConnection = data_source_1.db;
    const existingUser = yield data_source_1.db.findOne(User_1.default, { where: { email_id: user.email_id } });
    if (existingUser) {
        throw new errors_1.HttpConflict("User already exists for this email");
    }
    else {
        const salt = yield bcrypt_1.default.genSalt();
        const hashedPassword = yield bcrypt_1.default.hash(user.password, salt);
        user.password = hashedPassword;
        user.active = true;
        return yield dbConnection.save(User_1.default, user);
    }
});
exports.createUser = createUser;

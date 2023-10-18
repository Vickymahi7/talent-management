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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const checkUserAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader ? authHeader.split(' ')[1] : '';
    if (token) {
        jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                const error = new errors_1.HttpForbidden("Invalid Access Token");
                next(error);
            }
            else {
                const userId = decodedToken.user_id;
                const tenantId = decodedToken.tenant_id;
                req.headers.userId = userId;
                req.headers.tenantId = tenantId;
                next();
            }
        }));
    }
    else {
        const error = new errors_1.HttpUnauthorized("Unauthorized. Please login to continue");
        next(error);
    }
};
exports.default = checkUserAuth;

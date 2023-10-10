"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../utils/errors");
const httpStatusCode_1 = __importDefault(require("../utils/httpStatusCode"));
const errorHandler = (error, req, res, next) => {
    if (error instanceof errors_1.ApiError) {
        const statusCode = error.statusCode || httpStatusCode_1.default.INTERNAL_SERVER_ERROR;
        res.status(statusCode).json({ status: statusCode, mesaage: error.message });
    }
    else {
        res.sendStatus(httpStatusCode_1.default.INTERNAL_SERVER_ERROR);
    }
    console.error(error);
};
exports.default = errorHandler;

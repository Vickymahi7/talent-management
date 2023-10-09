"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../utils/errors");
const HttpStatusCode_1 = __importDefault(require("../constants/HttpStatusCode"));
const errorHandler = (error, req, res, next) => {
    if (error instanceof errors_1.ApiError) {
        const statusCode = error.statusCode || HttpStatusCode_1.default.INTERNAL_SERVER_ERROR;
        res.status(statusCode).json({ status: statusCode, mesaage: error.message });
    }
    else {
        res.sendStatus(HttpStatusCode_1.default.INTERNAL_SERVER_ERROR);
    }
};
exports.default = errorHandler;

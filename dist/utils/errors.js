"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpInternalServerError = exports.HttpConflict = exports.HttpNotFound = exports.HttpUnauthorized = exports.HttpBadRequest = exports.ApiError = void 0;
const httpStatusCode_1 = __importDefault(require("./httpStatusCode"));
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'Error';
        Error.captureStackTrace(this, ApiError);
    }
}
exports.ApiError = ApiError;
class HttpBadRequest extends ApiError {
    constructor(message) {
        super(message, httpStatusCode_1.default.BAD_REQUEST);
        this.name = 'BadRequest';
    }
}
exports.HttpBadRequest = HttpBadRequest;
class HttpUnauthorized extends ApiError {
    constructor(message) {
        super(message, httpStatusCode_1.default.UNAUTHORIZED);
        this.name = 'Unauthorized';
    }
}
exports.HttpUnauthorized = HttpUnauthorized;
class HttpNotFound extends ApiError {
    constructor(message) {
        super(message, httpStatusCode_1.default.NOT_FOUND);
        this.name = 'NotFound';
    }
}
exports.HttpNotFound = HttpNotFound;
class HttpConflict extends ApiError {
    constructor(message) {
        super(message, httpStatusCode_1.default.CONFLICT);
        this.name = 'Conflict';
    }
}
exports.HttpConflict = HttpConflict;
class HttpInternalServerError extends ApiError {
    constructor(message) {
        super(message, httpStatusCode_1.default.INTERNAL_SERVER_ERROR);
        this.name = 'HttpInternalServerError';
    }
}
exports.HttpInternalServerError = HttpInternalServerError;

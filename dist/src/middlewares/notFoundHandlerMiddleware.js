"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../utils/errors");
const notFoundHandler = (req, res, next) => {
    const error = new errors_1.HttpBadRequest("Not found");
    next(error);
};
exports.default = notFoundHandler;

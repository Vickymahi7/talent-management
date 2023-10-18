"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateHrProfileInput = exports.validateAddHrProfileInput = exports.validatePhotoUpload = exports.validateUpdateUserInput = exports.validateAddUserInput = exports.validateLoginInput = exports.validateUpdateTenantInput = exports.validateAddTenantInput = void 0;
const errors_1 = require("../utils/errors");
const validateAddTenantInput = (tenant) => {
    if (!tenant.name) {
        throw new errors_1.HttpBadRequest('Name is required');
    }
};
exports.validateAddTenantInput = validateAddTenantInput;
const validateUpdateTenantInput = (tenant) => {
    if (!tenant.tenant_id) {
        throw new errors_1.HttpBadRequest('Tenant Id is required');
    }
    if (!tenant.name) {
        throw new errors_1.HttpBadRequest('Name is required');
    }
};
exports.validateUpdateTenantInput = validateUpdateTenantInput;
const validateLoginInput = (email_id, password) => {
    if (!email_id) {
        throw new errors_1.HttpBadRequest('Email ID is required');
    }
    if (!password) {
        throw new errors_1.HttpBadRequest('Password is required');
    }
};
exports.validateLoginInput = validateLoginInput;
const validateAddUserInput = (user) => {
    if (!user.tenant_id) {
        throw new errors_1.HttpBadRequest('Tenant is required');
    }
    if (!user.user_name) {
        throw new errors_1.HttpBadRequest('User name is required');
    }
    if (!user.email_id) {
        throw new errors_1.HttpBadRequest('Email ID is required');
    }
    if (!user.password) {
        throw new errors_1.HttpBadRequest('Password is required');
    }
};
exports.validateAddUserInput = validateAddUserInput;
const validateUpdateUserInput = (user) => {
    if (!user.user_id) {
        throw new errors_1.HttpBadRequest("User Id is required");
    }
    if (!user.user_name) {
        throw new errors_1.HttpBadRequest('User name is required');
    }
    if (!user.email_id) {
        throw new errors_1.HttpBadRequest('Email ID is required');
    }
};
exports.validateUpdateUserInput = validateUpdateUserInput;
const validatePhotoUpload = (req) => {
    var _a, _b;
    const allowedExtensions = ["jpg", "jpeg", "png"];
    if (!req.file) {
        throw new errors_1.HttpBadRequest('Please select a photo to upload');
    }
    const fileExtension = (_b = (_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname.split(".").pop()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new errors_1.HttpBadRequest('Only image files are allowed');
    }
};
exports.validatePhotoUpload = validatePhotoUpload;
const validateAddHrProfileInput = (req) => {
    if (!req.body.email_id) {
        throw new errors_1.HttpBadRequest('Email ID is required');
    }
};
exports.validateAddHrProfileInput = validateAddHrProfileInput;
const validateUpdateHrProfileInput = (req) => {
    if (!req.body.hr_profile_id) {
        throw new errors_1.HttpBadRequest('Profile Id is required');
    }
    if (!req.body.user_id) {
        throw new errors_1.HttpBadRequest('User Id is required');
    }
    if (!req.body.email_id) {
        throw new errors_1.HttpBadRequest('Email ID is required');
    }
};
exports.validateUpdateHrProfileInput = validateUpdateHrProfileInput;

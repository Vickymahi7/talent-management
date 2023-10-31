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
exports.tenantView = exports.tenantUpdate = exports.tenantDelete = exports.tenantAdd = exports.getTenantList = void 0;
const data_source_1 = require("../data-source");
const Tenant_1 = __importDefault(require("../models/Tenant"));
const errors_1 = require("../utils/errors");
const httpStatusCode_1 = __importDefault(require("../utils/httpStatusCode"));
const validations_1 = require("../validations/validations");
const userFunctions_1 = require("../helperFunctions/userFunctions");
const hrProfleFunctions_1 = require("../helperFunctions/hrProfleFunctions");
const userTypes_1 = __importDefault(require("../utils/userTypes"));
/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: APIs for Managing Tenants
 * /tenant/add:
 *   post:
 *     summary: Add New Tenant, Creates Admin User & New Solr Core for the Tenant
 *     security:
 *       - bearerAuth: []
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               tenant_type_id:
 *                 type: number
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *               email_id:
 *                 type: string
 *             required:
 *               - name
 *               - user_name
 *               - password
 *               - email_id
 *             example:
 *               name: ABC Tech Pvt. Ltd.
 *               tenant_type_id: 1
 *               description: This is a description
 *               location: Delhi
 *               user_name: Demo Tenant
 *               email_id: demotenant@demo.com
 *               password: demo123
 *     responses:
 *       201:
 *         description: Created.
*/
const tenantAdd = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tenant = req.body;
        const user = req.body;
        (0, validations_1.validateAddTenantInput)(tenant);
        const currentUserId = req.headers.userId;
        // handling transaction
        yield data_source_1.db.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            tenant.active = true;
            tenant.created_by_id = parseInt(currentUserId);
            const response = yield transactionalEntityManager.save(Tenant_1.default, tenant);
            user.tenant_id = response.tenant_id;
            user.user_type_id = userTypes_1.default.ADMIN;
            (0, validations_1.validateAddUserInput)(user);
            yield (0, userFunctions_1.createUser)(user, transactionalEntityManager);
            yield (0, hrProfleFunctions_1.createSolrCore)(response.tenant_id);
            res.status(httpStatusCode_1.default.CREATED).json({ message: "Tenant Created Successfully" });
        }));
    }
    catch (error) {
        next(error);
    }
});
exports.tenantAdd = tenantAdd;
/**
 * @swagger
 * /tenant/list:
 *   get:
 *     summary: List all Tenants
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK.
*/
const getTenantList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tenantList = yield data_source_1.db.find(Tenant_1.default);
        res.status(httpStatusCode_1.default.OK).json({ tenantList });
    }
    catch (error) {
        next(error);
    }
});
exports.getTenantList = getTenantList;
/**
 * @swagger
 * /tenant/update:
 *   put:
 *     summary: Update Tenant Details
 *     tags: [Tenants]
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
 *               tenant_type_id:
 *                 type: number
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               active:
 *                 type: boolean
 *             required:
 *               - tenant_id
 *               - name
 *             example:
 *               tenant_id: 1
 *               tenant_type_id: 1
 *               name: ABC Tech Pvt. Ltd.
 *               description: This is a description
 *               location: Delhi
 *               active: true
 *     responses:
 *       200:
 *         description: OK.
 */
const tenantUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tenant = req.body;
        (0, validations_1.validateUpdateTenantInput)(tenant);
        const existingTenant = yield data_source_1.db.findOne(Tenant_1.default, {
            where: { tenant_id: tenant.tenant_id },
        });
        if (existingTenant) {
            const response = yield data_source_1.db.update(Tenant_1.default, tenant.tenant_id, {
                name: tenant.name,
                tenant_type_id: tenant.tenant_type_id,
                description: tenant.description,
                location: tenant.location,
                active: tenant.active,
            });
            if (response.affected && response.affected > 0) {
                res.status(httpStatusCode_1.default.OK).json({ message: "Tenant Updated Successfully" });
            }
        }
        else {
            throw new errors_1.HttpNotFound("Tenant Not Found");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.tenantUpdate = tenantUpdate;
/**
 * @swagger
 * /tenant/view/{id}:
 *   get:
 *     summary: Get Tenant Details by Tenant Id
 *     tags: [Tenants]
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
const tenantView = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tenantId = req.params.id;
        if (!tenantId) {
            throw new errors_1.HttpBadRequest("Tenant Id is required");
        }
        else {
            const tenant = yield data_source_1.db.findOne(Tenant_1.default, {
                where: { tenant_id: parseInt(tenantId) },
            });
            if (tenant) {
                res.status(httpStatusCode_1.default.OK).json({ tenant });
            }
            else {
                throw new errors_1.HttpNotFound("Tenant not found");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.tenantView = tenantView;
/**
 * @swagger
 * /tenant/delete/{id}:
 *   delete:
 *     summary: Delete a Tenant by Tenant Id
 *     tags: [Tenants]
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
const tenantDelete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tenantId = req.params.id;
        if (!tenantId) {
            throw new errors_1.HttpBadRequest("Tenant Id is required");
        }
        else {
            const response = yield data_source_1.db.delete(Tenant_1.default, tenantId);
            if (response.affected && response.affected > 0) {
                res.status(httpStatusCode_1.default.OK).json({ message: "Tenant Deleted Successfully" });
            }
            else {
                throw new errors_1.HttpNotFound("Tenant not found");
            }
        }
    }
    catch (error) {
        next(error);
    }
});
exports.tenantDelete = tenantDelete;

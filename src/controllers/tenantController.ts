import { NextFunction, Request, Response } from "express";
import { db } from "../data-source";
import User from "../models/User";
import Tenant from "../models/Tenant";
import { HttpBadRequest, HttpNotFound } from "../utils/errors";
import HttpStatusCode from "../utils/httpStatusCode";
import {
  validateAddUserInput,
  validateAddTenantInput,
  validateUpdateTenantInput,
} from "../validations/validations";
import { createUser } from "../helperFunctions/userFunctions";
import { createSolrCore } from "../helperFunctions/hrProfleFunctions";
import UserTypes from "../utils/userTypes";

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
const tenantAdd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant: Tenant = req.body;
    const user: User = req.body;

    validateAddTenantInput(tenant);
    validateAddUserInput(user);

    const currentUserId = req.headers.userId as string;

    // handling transaction
    await db.transaction(async (transactionalEntityManager) => {
      tenant.active = true;
      tenant.created_by_id = parseInt(currentUserId);

      const response = await transactionalEntityManager.save(Tenant, tenant);

      user.tenant_id = response.tenant_id;
      user.user_type_id = UserTypes.ADMIN;

      await createUser(user, transactionalEntityManager);
      await createSolrCore(response.tenant_id!);
      res
        .status(HttpStatusCode.CREATED)
        .json({ message: "Tenant Created Successfully" });
    });
  } catch (error) {
    next(error);
  }
};

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
const getTenantList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantList = await db.find(Tenant);
    res.status(HttpStatusCode.OK).json({ tenantList });
  } catch (error) {
    next(error);
  }
};

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
const tenantUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenant: Tenant = req.body;

    validateUpdateTenantInput(tenant);

    const existingTenant = await db.findOne(Tenant, {
      where: { tenant_id: tenant.tenant_id },
    });
    if (existingTenant) {
      const response = await db.update(Tenant, tenant.tenant_id, {
        name: tenant.name,
        tenant_type_id: tenant.tenant_type_id,
        description: tenant.description,
        location: tenant.location,
        active: tenant.active,
      });

      if (response.affected && response.affected > 0) {
        res
          .status(HttpStatusCode.OK)
          .json({ message: "Tenant Updated Successfully" });
      }
    } else {
      throw new HttpNotFound("Tenant Not Found");
    }
  } catch (error) {
    next(error);
  }
};

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
const tenantView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let tenantId = req.params.id;
    if (!tenantId) {
      throw new HttpBadRequest("Tenant Id is required");
    } else {
      const tenant = await db.findOne(Tenant, {
        where: { tenant_id: parseInt(tenantId) },
      });
      if (tenant) {
        res.status(HttpStatusCode.OK).json({ tenant });
      } else {
        throw new HttpNotFound("Tenant not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

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
const tenantDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let tenantId = req.params.id;
    if (!tenantId) {
      throw new HttpBadRequest("Tenant Id is required");
    } else {
      const response = await db.delete(Tenant, tenantId);
      if (response.affected && response.affected > 0) {
        res
          .status(HttpStatusCode.OK)
          .json({ message: "Tenant Deleted Successfully" });
      } else {
        throw new HttpNotFound("Tenant not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

export { getTenantList, tenantAdd, tenantDelete, tenantUpdate, tenantView };

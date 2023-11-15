import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { HttpBadRequest, HttpNotFound } from "../types/errors";
import { HttpStatusCode } from "../types/enums";
import {
  validateAddUserInput,
  validateAddTenantInput,
  validateUpdateTenantInput,
} from "../validations/validations";
import { createSolrCore } from "../helperFunctions/hrProfleFunctions";
import { UserTypes, AccountStatusId } from "../types/enums";
import { EntityManager } from "typeorm";
import Tenant from "../models/Tenant";
import { createUser } from "../helperFunctions/userFunctions";

const db = AppDataSource.manager;

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
 *               tenant_status_id:
 *                 type: number
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               user_name:
 *                 type: string
 *               email_id:
 *                 type: string
 *               phone:
 *                 type: string
 *             required:
 *               - name
 *               - user_name
 *               - email_id
 *             example:
 *               name: ABC Tech Pvt. Ltd.
 *               tenant_type_id: 1
 *               tenant_status_id: 1
 *               description: This is a description
 *               location: Delhi
 *               user_name: Demo Tenant
 *               email_id: demotenant@demo.com
 *               phone: "9876543210"
 *     responses:
 *       201:
 *         description: Created.
 */
export const tenantAdd = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateAddTenantInput(req.body);
    validateAddUserInput(req.body);

    const currentUserId = req.headers.userId as any;

    // handling transaction
    await db.transaction(async (transactionalEntityManager) => {
      // Create Tenant
      const response = await transactionalEntityManager.save(Tenant, {
        name: req.body.name,
        tenant_type_id:
          req.body.tenant_type_id == "" ? undefined : req.body.tenant_type_id,
        tenant_status_id: AccountStatusId.ACT,
        description: req.body.description,
        location: req.body.location,
        active: true,
        created_by_id: currentUserId == "" ? undefined : currentUserId,
      });

      req.body.tenant_id = response.tenant_id;
      req.body.user_type_id = UserTypes.ADM;

      // Create Primary User
      const userResponse = await createUser(
        req.body,
        transactionalEntityManager
      );

      // Update Primary User Id in Tenant
      await transactionalEntityManager.update(Tenant, response.tenant_id, {
        user_id: userResponse.user_id,
      });

      // Create Solr Core
      await createSolrCore(response.tenant_id!);
      res.status(HttpStatusCode.CREATED).json({
        status: HttpStatusCode.CREATED,
        message: "Tenant Created Successfully",
      });
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
export const getTenantList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantList = await db.find(Tenant, {
      relations: ["user"],
      select: {
        tenant_id: true,
        user_id: true,
        tenant_type_id: true,
        tenant_status_id: true,
        name: true,
        description: true,
        location: true,
        active: true,
        last_updated_dt: true,
        created_dt: true,
        user: {
          user_id: true,
          user_name: true,
          email_id: true,
          active: true,
        },
      },
    });
    res.status(HttpStatusCode.OK).json({ tenantList });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /tenant/update:
 *   patch:
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
 *               tenant_status_id:
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
 *               tenant_status_id: 1
 *               name: ABC Tech Pvt. Ltd.
 *               description: This is a description
 *               location: Delhi
 *               active: true
 *     responses:
 *       200:
 *         description: OK.
 */
export const tenantUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateUpdateTenantInput(req.body);

    const existingTenant = await db.findOne(Tenant, {
      where: { tenant_id: req.body.tenant_id },
    });
    if (existingTenant) {
      const response = await db.update(Tenant, req.body.tenant_id, {
        name: req.body.name,
        user_id: req.body.user_id,
        tenant_type_id:
          req.body.tenant_type_id == "" ? undefined : req.body.tenant_type_id,
        tenant_status_id:
          req.body.tenant_status_id == ""
            ? undefined
            : req.body.tenant_status_id,
        description: req.body.description,
        location: req.body.location,
        active: req.body.active,
      });

      if (response.affected && response.affected > 0) {
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "Tenant Updated Successfully",
        });
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
export const tenantView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let tenantId = req.params.id;
    if (!tenantId) {
      throw new HttpBadRequest("Tenant Id is required");
    } else {
      const tenant = await db.findOne(Tenant, {
        relations: ["user"],
        select: {
          tenant_id: true,
          user_id: true,
          tenant_type_id: true,
          tenant_status_id: true,
          name: true,
          description: true,
          location: true,
          active: true,
          created_dt: true,
          last_updated_dt: true,
          user: {
            user_id: true,
            user_name: true,
            email_id: true,
            active: true,
          },
        },
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
export const tenantDelete = async (
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
        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "Tenant Deleted Successfully",
        });
      } else {
        throw new HttpNotFound("Tenant not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

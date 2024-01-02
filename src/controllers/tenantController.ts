import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { AccountStatusId, HttpStatusCode, UserTypes } from "../enums/enums";
import { createSolrCore } from "../helperFunctions/hrProfleFunctions";
import { updateTenant } from "../helperFunctions/tenantFunctions";
import { createUser } from "../helperFunctions/userFunctions";
import Tenant from "../models/Tenant";
import { HttpBadRequest, HttpNotFound } from "../types/errors";
import { uploadFile } from "../utils/s3";
import {
  validateAddTenantInput,
  validateAddUserInput,
  validatePhotoUpload,
  validateUpdateTenantInput,
} from "../validations/validations";

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
        tenant_status_id: AccountStatusId.ACTIVE,
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
        message: "Tenant Created",
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
        logo_url: true,
        active: true,
        last_updated_dt: true,
        created_dt: true,
        user: {
          user_id: true,
          user_name: true,
          user_type_id: true,
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
 *               logo_url:
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
 *               logo_url:
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

    const response = await updateTenant(db, req.body);

    if (response.affected && response.affected > 0) {
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Tenant Updated",
      });
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
    let tenantId = parseInt(req.params.id);

    // if tenantId is 0, fetch current tenant details
    if (tenantId == 0) {
      const currentTenantId = req.headers.tenantId?.toString();
      tenantId = parseInt(currentTenantId!);
    }

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
          logo_url: true,
          active: true,
          created_dt: true,
          last_updated_dt: true,
          user: {
            user_id: true,
            user_name: true,
            user_type_id: true,
            email_id: true,
            active: true,
          },
        },
        where: { tenant_id: tenantId },
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
          message: "Tenant Deleted",
        });
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
 * /tenant/logoupload:
 *   post:
 *     summary: Upload Tenant Logo
 *     tags: [Tenant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - id
 *               - file
 *     responses:
 *       200:
 *         description: Ok.
 *     x-swagger-router-controller: "Default"
 */
export const tenantLogoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.body.id;
    const file = req.file;
    validatePhotoUpload(req);

    const fileBuffer = file?.buffer;
    const uploadLocation = process.env.AWS_TENANT_LOGO_PATH + tenantId;
    const fileUrl = `${process.env.AWS_SAVE_URL!}/${uploadLocation}`;

    const uploadRes = await uploadFile(
      fileBuffer,
      uploadLocation,
      file?.mimetype
    );

    const tenantData = {
      tenant_id: tenantId,
      logo_url: fileUrl,
    };

    const response = await updateTenant(db, tenantData);

    if (response.affected && response.affected > 0) {
      res.status(HttpStatusCode.OK).json({
        status: HttpStatusCode.OK,
        message: "Photo Uploaded",
      });
    }
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from 'express';
import { ResultSetHeader } from 'mysql2';
import db from '../database/dbConnection';
import User from '../models/userModel';
import Tenant from '../models/tenantModel';
import { HttpBadRequest, HttpNotFound } from '../utils/errors';
import HttpStatusCode from '../utils/httpStatusCode';
import { validateAddUserInput, validateAddTenantInput, validateUpdateTenantInput } from '../validations/validations';
import { createUser } from '../helperFunctions/userFunctions';
import { createSolrCore } from './hrProfileController';
import { runTransaction } from '../database/dbTransactions';

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
 *               user_name: Demo User
 *               password: demo123
 *               email_id: demouser@demo.com
 *     responses:
 *       201:
 *         description: Created.
*/
const tenantAdd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant: Tenant = req.body;
    const user: User = req.body;

    validateAddTenantInput(tenant);

    const currentUserId = req.headers.userId;

    // handle transaction
    await runTransaction(async (connection) => {

      const response = await connection.query(
        "INSERT INTO tenant (name,tenant_type_id,description,location,active,created_by_id,created_dt,last_updated_dt) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
        [tenant.name, tenant.tenant_type_id, tenant.description, tenant.location, true, currentUserId, new Date(), new Date()]
      );
      const resHeader = response[0] as ResultSetHeader;

      user.tenant_id = resHeader.insertId;
      user.user_type_id = 2;  // set user type as Admin

      validateAddUserInput(user);
      await createUser(user, connection);
      await createSolrCore(resHeader.insertId);
      res.status(HttpStatusCode.CREATED).json({ message: "Tenant Created Successfully" });
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
const getTenantList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.headers.tenantId;

    const [tenantList] = await db.query("SELECT * FROM tenant WHERE tenant_id = ?", [tenantId]);
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
const tenantUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant: Tenant = req.body;

    validateUpdateTenantInput(tenant);

    const [existingTenants] = await db.query("SELECT * FROM tenant WHERE tenant_id = ?", [tenant.tenant_id]);
    if (Array.isArray(existingTenants) && existingTenants.length > 0) {
      const existingTenant: Tenant = existingTenants[0] as Tenant;

      const response = await db.query(
        "UPDATE tenant SET name=?,tenant_type_id=?,description=?,location=?,active=?,last_updated_dt=? Where tenant_id = ?",
        [tenant.name, tenant.tenant_type_id, tenant.description, tenant.location, tenant.active, new Date(), tenant.tenant_id]
      );

      res.status(HttpStatusCode.OK).json({ message: "Tenant Updated Successfully" });
    }
    else {
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
    }
    else {
      const [tenantList] = await db.query("SELECT * FROM tenant WHERE tenant_id = ?", (tenantId));
      const tenant: Tenant = tenantList[0];
      if (tenant) {
        res.status(HttpStatusCode.OK).json({ tenant });
      }
      else {
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
const tenantDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let tenantId = req.params.id;
    if (!tenantId) {
      throw new HttpBadRequest("Tenant Id is required");
    }
    else {
      const [response] = await db.query("Delete FROM tenant WHERE tenant_id = ?", (tenantId));
      const resHeader = response as ResultSetHeader;
      if (resHeader.affectedRows > 0) {
        res.status(HttpStatusCode.OK).json({ message: "Tenant Deleted Successfully" });
      }
      else {
        throw new HttpNotFound("Tenant not found");
      }
    }
  } catch (error) {
    next(error);
  }
};

export { getTenantList, tenantAdd, tenantDelete, tenantUpdate, tenantView };


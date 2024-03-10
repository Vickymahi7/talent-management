import { UpdateResult } from "typeorm";
import { AppDataSource } from "../data-source";
import Tenant from "../models/Tenant";
import { HttpNotFound } from "../types/errors";
import { handleUserEmailChange } from "./userFunctions";
const db = AppDataSource.manager;

export const updateTenant = async (tenantData: any): Promise<any> => {
  let response: UpdateResult | null = null;

  await db.transaction(async (transactionalEntityManager) => {
    const existingTenant = await transactionalEntityManager.findOne(Tenant, {
      where: { tenant_id: tenantData.tenant_id },
    });

    if (existingTenant) {
      response = await transactionalEntityManager.update(
        Tenant,
        tenantData.tenant_id,
        {
          name: tenantData.name,
          user_id: tenantData.user_id,
          tenant_email_id: tenantData.tenant_email_id,
          tenant_phone: tenantData.tenant_phone,
          tenant_type_id:
            tenantData.tenant_type_id == ""
              ? undefined
              : tenantData.tenant_type_id,
          tenant_status_id:
            tenantData.tenant_status_id == ""
              ? undefined
              : tenantData.tenant_status_id,
          description: tenantData.description,
          location: tenantData.location,
          logo_url: tenantData.logo_url,
          is_official_contact_info: tenantData.is_official_contact_info,
          is_skill_experience: tenantData.is_skill_experience,
          active: tenantData.active,
          last_updated_dt: new Date().toISOString(),
        }
      );

      if (tenantData.user_id && tenantData.user.email_id) {
        const res = await handleUserEmailChange(
          transactionalEntityManager,
          tenantData.user_id,
          tenantData.user.email_id
        );
      }
    } else {
      throw new HttpNotFound("Tenant Not Found");
    }
  });
  return response;
};

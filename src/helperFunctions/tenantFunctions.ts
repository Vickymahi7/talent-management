import { AppDataSource } from "../data-source";
import Tenant from "../models/Tenant";
import { HttpNotFound } from "../types/errors";
const db = AppDataSource.manager;

export const updateTenant = async (dbConnection: any, tenantData: any) => {
  const existingTenant = await dbConnection.findOne(Tenant, {
    where: { tenant_id: tenantData.tenant_id },
  });
  if (existingTenant) {
    const response = await dbConnection.update(Tenant, tenantData.tenant_id, {
      name: tenantData.name,
      user_id: tenantData.user_id,
      tenant_email_id: tenantData.tenant_email_id,
      tenant_phone: tenantData.tenant_phone,
      tenant_type_id:
        tenantData.tenant_type_id == "" ? undefined : tenantData.tenant_type_id,
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
    });
    return response;
  } else {
    throw new HttpNotFound("Tenant Not Found");
  }
};

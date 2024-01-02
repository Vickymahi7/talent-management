import Tenant from "../models/Tenant";
import { HttpNotFound } from "../types/errors";

export const updateTenant = async (db: any, tenantData: any) => {
  const existingTenant = await db.findOne(Tenant, {
    where: { tenant_id: tenantData.tenant_id },
  });
  if (existingTenant) {
    const response = await db.update(Tenant, tenantData.tenant_id, {
      name: tenantData.name,
      user_id: tenantData.user_id,
      tenant_type_id:
        tenantData.tenant_type_id == "" ? undefined : tenantData.tenant_type_id,
      tenant_status_id:
        tenantData.tenant_status_id == ""
          ? undefined
          : tenantData.tenant_status_id,
      description: tenantData.description,
      location: tenantData.location,
      logo_url: tenantData.logo_url,
      active: tenantData.active,
    });
    return response;
  } else {
    throw new HttpNotFound("Tenant Not Found");
  }
};

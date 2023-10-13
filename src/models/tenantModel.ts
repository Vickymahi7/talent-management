interface Tenant {
  tenant_id?: number,
  name?: string,
  tenant_type_id?: string,
  description?: string,
  location?: string,
  active?: boolean,
  created_by_id?: number,
  created_dt?: string,
  last_updated_dt?: string,
}

export default Tenant;
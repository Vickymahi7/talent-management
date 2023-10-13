interface User {
  user_id?: number,
  tenant_id?: number,
  user_type_id?: number,
  user_name?: string,
  password?: string,
  email_id?: string,
  authtoken?: string,
  user_status_id?: number,
  active?: boolean,
  created_by_id?: number,
  created_dt?: string,
  last_access?: string,
  last_updated_dt?: string,
}

export default User;
interface HrProfile {
  id?: string,
  hr_profile_id?: string,
  hr_profile_type_id?: number,
  first_name?: string,
  last_name?: string,
  middle_name?: string,
  position?: string,
  email_id?: string,
  alternate_email_id?: string,
  mobile?: string,
  alternate_mobile?: string,
  phone?: string,
  office_phone?: string,
  gender?: string,
  date_of_birth?: string,
  resume_url?: string,
  photo_url?: string,
  buiding_number?: string,
  street_name?: string,
  city?: string,
  state?: string,
  country?: string,
  postal_code?: string,
  website?: string,
  facebook_id?: string,
  twitter_id?: string,
  linkedin_id?: string,
  skype_id?: string,
  status_id?: number,
  user_id?: number,
  active?: boolean,
  created_by_id?: number,
  created_dt?: string,
  last_updated_dt?: string,
  skills?: any,
  work_experience?: any,
  project?: any,
  education?: any,
}

export default HrProfile;
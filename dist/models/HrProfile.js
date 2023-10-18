"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HrProfile {
    constructor(data) {
        this.id = data.id;
        this.hr_profile_id = data.hr_profile_id;
        this.tenant_id = data.tenant_id;
        this.hr_profile_type_id = data.hr_profile_type_id;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.middle_name = data.middle_name;
        this.position = data.position;
        this.email_id = data.email_id;
        this.alternate_email_id = data.alternate_email_id;
        this.mobile = data.mobile;
        this.alternate_mobile = data.alternate_mobile;
        this.phone = data.phone;
        this.office_phone = data.office_phone;
        this.objective = data.objective;
        this.gender = data.gender;
        this.date_of_birth = data.date_of_birth;
        this.resume_url = data.resume_url;
        this.photo_url = data.photo_url;
        this.buiding_number = data.buiding_number;
        this.street_name = data.street_name;
        this.city = data.city;
        this.state = data.state;
        this.country = data.country;
        this.postal_code = data.postal_code;
        this.website = data.website;
        this.facebook_id = data.facebook_id;
        this.twitter_id = data.twitter_id;
        this.linkedin_id = data.linkedin_id;
        this.skype_id = data.skype_id;
        this.status_id = data.status_id;
        this.user_id = data.user_id;
        this.active = data.active;
        this.created_by_id = data.created_by_id;
        this.created_dt = data.created_dt;
        this.last_updated_dt = data.last_updated_dt;
        this.skills = data.skills ? JSON.stringify(data.skills) : "";
        this.work_experience = data.work_experience ? JSON.stringify(data.work_experience) : "";
        this.project = data.project ? JSON.stringify(data.project) : "";
        this.education = data.education ? JSON.stringify(data.education) : "";
    }
}
exports.default = HrProfile;

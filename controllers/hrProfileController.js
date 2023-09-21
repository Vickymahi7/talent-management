let hrProfileList = require('../models/hrProfileList.json');
let contactList = require('../models/contactList.json');
let addressList = require('../models/addressList.json');
let projectList = require('../models/projectList.json');
let educationList = require('../models/educationList.json');
let workExperienceList = require('../models/workExperienceList.json');

let hrProfileIdCount = 1;

const getHrProfileList = async (req, res, next) => {
    try {
        res.status(200).json({ hrProfileList });
    } catch (error) {
        next(error);
    }
}

const hrProfileAdd = async (req, res, next) => {
    try {
        hrProfileIdCount++;

        let hrProfile = { ...req.body, hr_profile_id: hrProfileIdCount, contact_id: hrProfileIdCount };
        hrProfileList.push(hrProfile);

        res.status(201).json({ message: 'Profile Added Successfully' });
    } catch (error) {
        next(error);
    }
}

const hrProfileUpdate = async (req, res, next) => {
    try {
        let hrProfile = req.body;

        if (hrProfileList.length > 0 && hrProfile.hr_profile_id) {
            let hrProfileData = hrProfileList.find(data => data.hr_profile_id == hrProfile.hr_profile_id);
            if (hrProfileData && hrProfileData.hr_profile_id) {
                hrProfileList = hrProfileList.map(data => {
                    if (data.hr_profile_id == hrProfile.hr_profile_id) {
                        data = hrProfile;
                    }
                    return data;
                })
                return res.status(200).json({ message: 'Profile Updated Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const hrProfileView = async (req, res, next) => {
    try {
        let hrProfileId = req.params.id;
        if (hrProfileList.length > 0 && hrProfileId) {
            const hrProfile = hrProfileList.find(data => data.hr_profile_id == hrProfileId);
            if (hrProfile && hrProfile.hr_profile_id) {
                return res.status(200).json({ hrProfile });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const getHrProfileDetail = async (req, res, next) => {
    try {
        let hrProfileId = req.params.id;
        if (hrProfileList.length > 0 && hrProfileId) {
            const hrProfile = hrProfileList.find(data => data.hr_profile_id == hrProfileId);
            if (hrProfile && hrProfile.hr_profile_id) {
                let contact = contactList.find(data => data.contact_id == hrProfile.contact_id);
                contact = contact ? contact : null;
                if (contact) {
                    let address = addressList.find(data => data.contact_id == contact.contact_id);
                    address = address ? address : null;
                    contact = { ...contact, ...{ address } }
                }
                let education = educationList.filter(data => data.hr_profile_id == hrProfileId);
                education = education ? education : null;
                let workExperience = workExperienceList.filter(data => data.hr_profile_id == hrProfileId);
                workExperience = workExperience ? workExperience : null;
                let project = projectList.filter(data => data.hr_profile_id == hrProfileId);
                project = project ? project : null;
                let hrProfileDetail = { ...hrProfile, contact: contact, education: education, project: project, work_experience: workExperience };
                return res.status(200).json({ hrProfileDetail });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const hrProfileDelete = async (req, res, next) => {
    try {
        let hrProfileId = req.params.id;
        if (hrProfileList.length > 0 && hrProfileId) {
            let hrProfileData = hrProfileList.find(data => data.hr_profile_id == hrProfileId);
            if (hrProfileData && hrProfileData.hr_profile_id) {
                hrProfileList = hrProfileList.filter(data => data.hr_profile_id != hrProfileId);
                return res.status(200).json({ message: 'Profile Deleted Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getHrProfileList,
    hrProfileAdd,
    hrProfileUpdate,
    hrProfileView,
    getHrProfileDetail,
    hrProfileDelete,
}
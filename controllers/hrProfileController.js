let hrProfileList = require('../models/hrProfileList.json');

let hrProfileIdCount = 1;

const getHrProfileList = async (req, res, next) => {
    try {
        hrProfileList.map(data => {
            // data.contact = data.contact ? JSON.parse(data.contact) : '';
            data.work_experience = data.work_experience ? JSON.parse(data.work_experience) : '';
            data.project = data.project ? JSON.parse(data.project) : '';
            data.education = data.education ? JSON.parse(data.education) : '';
            data.skills = data.skills ? JSON.parse(data.skills) : '';
            return data;
        })
        res.status(200).json({ hrProfileList });
    } catch (error) {
        next(error);
    }
}

const hrProfileAdd = async (req, res, next) => {
    try {
        if (!req.body.email_id || req.body.email_id == '') {
            return res.status(400).json({ message: 'Email Id is required' });
        }

        // const contact = req.body.contact ? JSON.stringify(req.body.contact) : '';
        const work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : '';
        const project = req.body.project ? JSON.stringify(req.body.project) : '';
        const education = req.body.education ? JSON.stringify(req.body.education) : '';
        const skills = req.body.skills ? JSON.stringify(req.body.skills) : '';
        hrProfileIdCount++;

        let hrProfile = {
            ...req.body,
            hr_profile_id: hrProfileIdCount,
            ...{ contact },
            ...{ work_experience },
            ...{ project },
            ...{ education },
            ...{ skills },
        };
        hrProfileList.push(hrProfile);

        res.status(201).json({ message: 'Profile Added Successfully' });
    } catch (error) {
        next(error);
    }
}

const hrProfileUpdate = async (req, res, next) => {
    try {

        if (hrProfileList.length > 0 && req.body.hr_profile_id) {
            if (!req.body.email_id || req.body.email_id == '') {
                return res.status(400).json({ message: 'Email Id is required' });
            }

            let hrProfileData = hrProfileList.find(data => data.hr_profile_id == req.body.hr_profile_id);
            if (hrProfileData && hrProfileData.hr_profile_id) {
                hrProfileList = hrProfileList.map(data => {
                    if (data.hr_profile_id == req.body.hr_profile_id) {
                        data = req.body;
                        data.work_experience = data.work_experience ? JSON.stringify(data.work_experience) : '';
                        data.project = data.project ? JSON.stringify(data.project) : '';
                        data.education = data.education ? JSON.stringify(data.education) : '';
                        data.skills = data.skills ? JSON.stringify(data.skills) : '';
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
    hrProfileDelete,
}
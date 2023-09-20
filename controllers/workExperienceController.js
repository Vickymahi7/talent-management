let workExperienceList = require('../models/workExperienceList.json');

let workExperienceIdCount = 1;

const getWorkExperienceList = async (req, res, next) => {
    try {
        res.status(200).json({ workExperienceList });
    } catch (error) {
        next(error);
    }
}

const workExperienceAdd = async (req, res, next) => {
    try {
        workExperienceIdCount++;
        let workExperience = { ...req.body, work_experience_id: workExperienceIdCount };
        workExperienceList.push(workExperience);
        res.status(201).json({ message: 'Work Experience Added Successfully' });
    } catch (error) {
        next(error);
    }
}

const workExperienceUpdate = async (req, res, next) => {
    try {
        let workExperience = req.body;
        if (workExperienceList.length > 0 && workExperience.work_experience_id) {
            let workExperienceData = workExperienceList.find(data => data.work_experience_id == workExperience.work_experience_id);
            if (workExperienceData && workExperienceData.work_experience_id) {
                workExperienceList = workExperienceList.map(data => {
                    if (data.work_experience_id == workExperience.work_experience_id) {
                        data = workExperience;
                    }
                    return data;
                })
                return res.status(200).json({ message: 'Work Experience Updated Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const workExperienceView = async (req, res, next) => {
    try {
        let workExperienceId = req.params.id;
        if (workExperienceList.length > 0 && workExperienceId) {
            const workExperience = workExperienceList.find(data => data.work_experience_id == workExperienceId);
            if (workExperience && workExperience.work_experience_id) {
                return res.status(200).json({ workExperience });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const workExperienceDelete = async (req, res, next) => {
    try {
        let workExperienceId = req.params.id;
        if (workExperienceList.length > 0 && workExperienceId) {
            let workExperienceData = workExperienceList.find(data => data.work_experience_id == workExperienceId);
            if (workExperienceData && workExperienceData.work_experience_id) {
                workExperienceList = workExperienceList.filter(data => data.work_experience_id != workExperienceId);
                return res.status(200).json({ message: 'Work Experience Deleted Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getWorkExperienceList,
    workExperienceAdd,
    workExperienceUpdate,
    workExperienceView,
    workExperienceDelete,
}
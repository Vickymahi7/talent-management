let educationList = require('../models/educationList.json');
let educationIdCount = 1;

const getEducationList = async (req, res, next) => {
    try {
        res.status(200).json({ educationList });
    } catch (error) {
        next(error);
    }
}

const educationAdd = async (req, res, next) => {
    try {
        educationIdCount++;
        let education = { ...req.body, education_id: educationIdCount };
        educationList.push(education);
        res.status(201).json({ message: 'Education Added Successfully' });
    } catch (error) {
        next(error);
    }
}

const educationUpdate = async (req, res, next) => {
    try {
        let education = req.body;
        if (educationList.length > 0 && education.education_id) {
            let educationData = educationList.find(data => data.education_id == education.education_id);
            if (educationData && educationData.education_id) {
                educationList = educationList.map(data => {
                    if (data.education_id == education.education_id) {
                        data = education;
                    }
                    return data;
                })
                return res.status(200).json({ message: 'Education Updated Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const educationView = async (req, res, next) => {
    try {
        let educationId = req.params.id;
        if (educationList.length > 0 && educationId) {
            const education = educationList.find(data => data.education_id == educationId);
            if (education && education.education_id) {
                return res.status(200).json({ education });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const educationDelete = async (req, res, next) => {
    try {
        let educationId = req.params.id;
        if (educationList.length > 0 && educationId) {
            let educationData = educationList.find(data => data.education_id == educationId);
            if (educationData && educationData.education_id) {
                educationList = educationList.filter(data => data.education_id != educationId);
                return res.status(200).json({ message: 'Education Deleted Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEducationList,
    educationAdd,
    educationUpdate,
    educationView,
    educationDelete,
}
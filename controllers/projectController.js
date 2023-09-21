let projectList = require('../models/projectList.json');
let projectIdCount = 1;

const getProjectList = async (req, res, next) => {
    try {
        res.status(200).json({ projectList });
    } catch (error) {
        next(error);
    }
}

const projectAdd = async (req, res, next) => {
    try {
        const addressId = projectList.length + 1;
        projectIdCount++;
        let project = { ...req.body, project_id: projectIdCount, address_id: addressId, };
        projectList.push(project);

        res.status(201).json({ message: 'Project Created Successfully' });
    } catch (error) {
        next(error);
    }
}

const projectUpdate = async (req, res, next) => {
    try {
        let project = req.body;
        if (projectList.length > 0 && project.project_id) {
            let projectData = projectList.find(data => data.project_id == project.project_id);
            if (projectData && projectData.project_id) {
                projectList = projectList.map(data => {
                    if (data.project_id == project.project_id) {
                        data = project;
                    }
                    return data;
                })
                return res.status(200).json({ message: 'Project Updated Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const projectView = async (req, res, next) => {
    try {
        let projectId = req.params.id;
        if (projectList.length > 0 && projectId) {
            const project = projectList.find(data => data.project_id == projectId);
            if (project && project.project_id) {
                return res.status(200).json({ project });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

const projectDelete = async (req, res, next) => {
    let projectId = req.params.id;
    try {
        if (projectList.length > 0 && projectId) {
            let projectData = projectList.find(data => data.project_id == projectId);
            if (projectData && projectData.project_id) {
                projectList = projectList.filter(data => data.project_id != projectId);
                return res.status(200).json({ message: 'Project Deleted Successfully' });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProjectList,
    projectAdd,
    projectUpdate,
    projectView,
    projectDelete,
}
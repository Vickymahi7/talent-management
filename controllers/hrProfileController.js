let hrProfileList = require('../models/hrProfileList.json');

let hrProfileIdCount = 1;

/**
 * @swagger
 * components:
 *   schemas:
 *     HrProfile:
 *       type: object
 *       properties:
 *         hr_profile_id:
 *           type: number
 *         hr_profile_type_id:
 *           type: number
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         middle_name:
 *           type: string
 *         position:
 *           type: string
 *         email_id:
 *           type: string
 *         alternate_email_id:
 *           type: string
 *         mobile:
 *           type: string
 *         alternate_mobile:
 *           type: string
 *         phone:
 *           type: string
 *         office_phone:
 *           type: string
 *         gender:
 *           type: string
 *         date_of_birth:
 *           type: string
 *         resume_url:
 *           type: string
 *         photo_url:
 *           type: string
 *         buiding_:
 *           type: string
 *         street_name:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         country:
 *           type: string
 *         postal_code:
 *           type: string
 *         website:
 *           type: string
 *         facebook_id:
 *           type: string
 *         twitter_id:
 *           type: string
 *         linkedin_id:
 *           type: string
 *         skype_id:
 *           type: string
 *         status_id:
 *           type: number
 *         user_id:
 *           type: number
 *         active:
 *           type: boolean
 *         created_by_id:
 *           type: number
 *         created_dt:
 *           type: string
 *         last_updated_dt:
 *           type: string
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *         work_experience:
 *           type: object
 *           properties:
 *             company:
 *               type: string
 *             location:
 *               type: string
 *             start_date:
 *               type: string
 *             end_date:
 *               type: string
 *             description:
 *               type: string
 *         project:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             start_date:
 *               type: string
 *             end_date:
 *               type: string
 *             client:
 *               type: string
 *             technology:
 *               type: string
 *             description:
 *               type: string
 *             location:
 *               type: string
 *         education:
 *           type: object
 *           properties:
 *             degree:
 *               type: string
 *             major:
 *               type: string
 *             university:
 *               type: string
 *             location:
 *               type: string
 *             start_date:
 *               type: string
 *             end_date:
 *               type: string
 */

/**
 * @swagger 
 * tags:
 *   name: HR Profile
 *   description: APIs for Managing HR Profiles
 * /hrprofile/list:
 *   get:
 *     summary: List all Profiles
 *     tags: [HR Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Successful Response
 *       500:
 *         description: Server error
 */
const getHrProfileList = async (req, res, next) => {
    try {
        const newList = hrProfileList.map(data => {
            const newData = { ...data };
            newData.work_experience = data.work_experience ? JSON.parse(data.work_experience) : '';
            newData.project = data.project ? JSON.parse(data.project) : '';
            newData.education = data.education ? JSON.parse(data.education) : '';
            newData.skills = data.skills ? JSON.parse(data.skills) : '';
            return newData;
        })
        res.status(200).json({ hrProfileList: newList });
    } catch (error) {
        next(error);
    }
}


/**
 * @swagger 
 * /hrprofile/add:
 *   post:
 *     summary: Add New Profile
 *     tags: [HR Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrProfile'
 *             example:
 *               hr_profile_id: 1
 *               hr_profile_type_id: null
 *               first_name: Vignesh
 *               last_name: Vicky
 *               middle_name: 
 *               position: Junior Developer
 *               email_id: demouser@demo.com
 *               alternate_email_id: null
 *               mobile: 9874512300
 *               alternate_mobile: 
 *               phone: 
 *               office_phone: 
 *               gender: M
 *               date_of_birth: 
 *               resume_url: null
 *               photo_url: 
 *               buiding_number: 18/21
 *               street_name: North Street
 *               city: Chennai
 *               state: Tamil Nadu
 *               country: India
 *               postal_code: 
 *               website: http://test.com
 *               facebook_id: 
 *               twitter_id: 
 *               linkedin_id: 
 *               skype_id: 
 *               status_id: 1
 *               user_id: 1
 *               active: 1
 *               created_by_id: null
 *               created_dt: null
 *               last_updated_dt: null
 *               skills:
 *                 - Java
 *                 - Javascript
 *               work_experience:
 *                 - company: Test IT
 *                   location: Chennai
 *                   start_date: 2019-08-15
 *                   end_date: null
 *                   description: Worked as a frontend developer
 *               project:
 *                 - title: Project Management
 *                   start_date: 2019-08-15
 *                   end_date: 2022-08-15
 *                   client: Application Users
 *                   technology: Java, Javascript, Vue Js, MySQL
 *                   description: Created a Project Management Application
 *                   location: Chennai
 *               education:
 *                 - degree: BE
 *                   major: Computer Science Engineering
 *                   university: VIT
 *                   location: Chennai
 *                   start_date: 2011-08-28
 *                   end_date: 2015-04-30
 *     responses:
 *       201:
 *         description: Record Created.
 *       400:
 *         description: Bad Request.
 *       409:
 *         description: Conflict.
 *       500:
 *         description: Server error
 */
const hrProfileAdd = async (req, res, next) => {
    try {
        if (!req.body.email_id || req.body.email_id == '') {
            return res.status(400).json({ message: 'Email Id is required' });
        }

        const work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : '';
        const project = req.body.project ? JSON.stringify(req.body.project) : '';
        const education = req.body.education ? JSON.stringify(req.body.education) : '';
        const skills = req.body.skills ? JSON.stringify(req.body.skills) : '';
        hrProfileIdCount++;

        let hrProfile = {
            ...req.body,
            hr_profile_id: hrProfileIdCount,
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

/**
 * @swagger 
 * /hrprofile/update:
 *   put:
 *     summary: Update Profile
 *     tags: [HR Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrProfile'
 *             example:
 *               hr_profile_id: 1
 *               hr_profile_type_id: null
 *               first_name: Vignesh
 *               last_name: Vicky
 *               middle_name: 
 *               position: Junior Developer
 *               email_id: demouser@demo.com
 *               alternate_email_id: null
 *               mobile: 9874512300
 *               alternate_mobile: 
 *               phone: 
 *               office_phone: 
 *               gender: M
 *               date_of_birth: 
 *               resume_url: null
 *               photo_url: 
 *               buiding_number: 18/21
 *               street_name: North Street
 *               city: Chennai
 *               state: Tamil Nadu
 *               country: India
 *               postal_code: 
 *               website: http://test.com
 *               facebook_id: 
 *               twitter_id: 
 *               linkedin_id: 
 *               skype_id: 
 *               status_id: 1
 *               user_id: 1
 *               active: 1
 *               created_by_id: null
 *               created_dt: null
 *               last_updated_dt: null
 *               skills:
 *                 - Java
 *                 - Javascript
 *               work_experience:
 *                 - company: Test IT
 *                   location: Chennai
 *                   start_date: 2019-08-15
 *                   end_date: null
 *                   description: Worked as a frontend developer
 *               project:
 *                 - title: Project Management
 *                   start_date: 2019-08-15
 *                   end_date: 2022-08-15
 *                   client: Application Users
 *                   technology: Java, Javascript, Vue Js, MySQL
 *                   description: Created a Project Management Application
 *                   location: Chennai
 *               education:
 *                 - degree: BE
 *                   major: Computer Science Engineering
 *                   university: VIT
 *                   location: Chennai
 *                   start_date: 2011-08-28
 *                   end_date: 2015-04-30
 *     responses:
 *       201:
 *         description: Record Created.
 *       400:
 *         description: Bad Request.
 *       409:
 *         description: Conflict.
 *       500:
 *         description: Server error
 */
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


/**
 * @swagger 
 * /hrprofile/view/{id}:
 *   get:
 *     summary: View Profile
 *     tags: [HR Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: Successful response.
 *       404:
 *         description: Not Found.
 *       500:
 *         description: Server error
 */
const hrProfileView = async (req, res, next) => {
    try {
        let hrProfileId = req.params.id;
        if (hrProfileList.length > 0 && hrProfileId) {
            const hrProfileData = hrProfileList.find(data => data.hr_profile_id == hrProfileId);
            if (hrProfileData && hrProfileData.hr_profile_id) {
                const hrProfile = { ...hrProfileData };
                hrProfile.work_experience = hrProfile.work_experience ? JSON.parse(hrProfile.work_experience) : '';
                hrProfile.project = hrProfile.project ? JSON.parse(hrProfile.project) : '';
                hrProfile.education = hrProfile.education ? JSON.parse(hrProfile.education) : '';
                hrProfile.skills = hrProfile.skills ? JSON.parse(hrProfile.skills) : '';

                return res.status(200).json({ hrProfile });
            }
        }
        res.status(404).json({ message: 'Record not found' });
    } catch (error) {
        next(error);
    }
}

/**
 * @swagger 
 * /hrprofile/delete/{id}:
 *   delete:
 *     summary: Delete Profile
 *     tags: [HR Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: integer
 *     responses:
 *       200:
 *         description: Successful response.
 *       404:
 *         description: Not Found.
 *       500:
 *         description: Server error
 */
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
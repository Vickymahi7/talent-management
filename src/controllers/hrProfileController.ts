import { NextFunction, Request, Response } from 'express';
import HttpStatusCode from '../constants/HttpStatusCode';
import { HttpNotFound, HttpBadRequest } from '../utils/errors';
import hrProfileListData from "../models/hrProfileList.json";
import { validatePhotoUpload, validateAddHrProfileInput, validateUpdateHrProfileInput } from "../validations/validations";

let hrProfileList: any[] = hrProfileListData;
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
 *     parameters:
 *       - in: query
 *         name: skills
 *         description: To filter Resumes based on skill
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK.
 */
const getHrProfileList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { skills } = req.query;
    skills = skills ? skills[0].toLowerCase() : '';

    const newList = hrProfileList
      .filter((data) => {
        const existingSkills = data.skills ? JSON.parse(data.skills.toLowerCase()) : [];
        return !skills || existingSkills.includes(skills);
      })
      .map((data) => ({
        ...data,
        work_experience: data.work_experience ? JSON.parse(data.work_experience) : [],
        project: data.project ? JSON.parse(data.project) : [],
        education: data.education ? JSON.parse(data.education) : [],
        skills: data.skills ? JSON.parse(data.skills) : []
      }));

    res.status(HttpStatusCode.OK).json({ hrProfileList: newList });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/photoupload:
 *   post:
 *     summary: Upload Profile Picture
 *     tags: [HR Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - id
 *               - file
 *     responses:
 *       200:
 *         description: Ok.
 *     x-swagger-router-controller: "Default"
 */
const hrProfilePhotoUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validatePhotoUpload(req);

    const file = req.file;
    const hrProfileIndex = hrProfileList.findIndex((data) => data.hr_profile_id == req.body.id);
    if (hrProfileIndex !== -1) {
      const filePath = file ? file.path : "";
      hrProfileList[hrProfileIndex] = { ...hrProfileList[hrProfileIndex], photo_url: filePath };

      res.status(HttpStatusCode.OK).json({ message: "Photo Uploaded Successfully" });

    } else {
      throw new HttpNotFound("Record Not Found");
    }
  } catch (error) {
    next(error);
  }
};

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
 *               active: true
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
 *         description: Created.
 */
const hrProfileAdd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateAddHrProfileInput(req);

    const work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : "";
    const project = req.body.project ? JSON.stringify(req.body.project) : "";
    const education = req.body.education ? JSON.stringify(req.body.education) : "";
    const skills = req.body.skills ? JSON.stringify(req.body.skills) : "";
    hrProfileIdCount++;

    const hrProfile = {
      ...req.body,
      hr_profile_id: hrProfileIdCount,
      ...{ work_experience },
      ...{ project },
      ...{ education },
      ...{ skills },
    };
    hrProfileList.push(hrProfile);

    res.status(HttpStatusCode.CREATED).json({ message: "Profile Added Successfully" });
  } catch (error) {
    next(error);
  }
};

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
 *               active: true
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
 *       200:
 *         description: OK.
 */
const hrProfileUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    validateUpdateHrProfileInput(req);
    const hrProfileIndex = hrProfileList.findIndex((data) => data.hr_profile_id == req.body.id);
    if (hrProfileIndex !== -1) {
      const work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : "";
      const project = req.body.project ? JSON.stringify(req.body.project) : "";
      const education = req.body.education ? JSON.stringify(req.body.education) : "";
      const skills = req.body.skills ? JSON.stringify(req.body.skills) : "";

      hrProfileList[hrProfileIndex] = {
        ...hrProfileList[hrProfileIndex],
        ...{ work_experience },
        ...{ project },
        ...{ education },
        ...{ skills },
      };
      res.status(HttpStatusCode.OK).json({ message: "Profile Updated Successfully" });
    }
    else {
      throw new HttpNotFound("Record Not Found");
    }
  } catch (error) {
    next(error);
  }
};

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
 *         description: OK.
 */
const hrProfileView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let hrProfileId = req.params.id;
    if (!hrProfileId) {
      throw new HttpBadRequest("Profile Id is required");
    }
    const hrProfileData = hrProfileList.find(
      (data) => data.hr_profile_id == hrProfileId
    );
    if (hrProfileData) {
      const hrProfile = { ...hrProfileData };
      hrProfile.work_experience = hrProfile.work_experience ? JSON.parse(hrProfile.work_experience) : [];
      hrProfile.project = hrProfile.project ? JSON.parse(hrProfile.project) : [];
      hrProfile.education = hrProfile.education ? JSON.parse(hrProfile.education) : [];
      hrProfile.skills = hrProfile.skills ? JSON.parse(hrProfile.skills) : [];

      return res.status(HttpStatusCode.OK).json({ hrProfile });
    } else {
      throw new HttpNotFound("Record Not Found");
    }
  } catch (error) {
    next(error);
  }
};

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
 *         description: OK.
 */
const hrProfileDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let hrProfileId = req.params.id;
    if (!hrProfileId) {
      throw new HttpBadRequest("Profile Id is required");
    }
    const hrProfileIndex = hrProfileList.findIndex((data) => data.hr_profile_id == hrProfileId);
    if (hrProfileIndex !== -1) {

      hrProfileList.splice(hrProfileIndex, 1);

      res.status(HttpStatusCode.OK).json({ message: "Profile Deleted Successfully" });
    }
    else {
      throw new HttpNotFound("Record Not Found");
    }
  } catch (error) {
    next(error);
  }
};

export {
  getHrProfileList, hrProfileAdd, hrProfileDelete, hrProfilePhotoUpload, hrProfileUpdate,
  hrProfileView
};


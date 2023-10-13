import { NextFunction, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import HttpStatusCode from '../utils/httpStatusCode';
import { HttpNotFound, HttpBadRequest, HttpInternalServerError } from '../utils/errors';
import hrProfileListData from "../models/hrProfileList.json";
import HrProfile from "../models/hrProfileModel";
import { config } from "dotenv";
import { validatePhotoUpload, validateAddHrProfileInput, validateUpdateHrProfileInput } from "../validations/validations";
config();

let hrProfileList: any[] = hrProfileListData;

const SOLR_BASE_URL = process.env.SOLR_BASE_URL;
const SOLR_CORE_PREFIX = process.env.SOLR_CORE_PREFIX;

/**
 * @swagger
 * components:
 *   schemas:
 *     HrProfile:
 *       type: object
 *       properties:
 *         hr_profile_id:
 *           type: number
 *         tenant_id:
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
 *       200:
 *         description: OK.
 */
const getHrProfileList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;
    const params = {
      q: '*:*',
      wt: 'json',
    };

    let response: AxiosResponse = await axios.get(`${SOLR_BASE_URL}/${solrCore}/select`, { params })

    const hrProfileList: HrProfile[] = response.data.response.docs.map((data: any) => ({
      ...data,
      work_experience: data.work_experience ? JSON.parse(data.work_experience) : [],
      project: data.project ? JSON.parse(data.project) : [],
      education: data.education ? JSON.parse(data.education) : [],
      skills: data.skills ? JSON.parse(data.skills) : []
    }));

    res.status(HttpStatusCode.OK).json({ hrProfileList });
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
      throw new HttpNotFound("Profile Not Found");
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
    const currentUserId = req.headers.userId as unknown as number;
    const tenantId = req.headers.tenantId as unknown as number;
    const solrCore = SOLR_CORE_PREFIX! + tenantId;
    const hrProfile: HrProfile = req.body;

    hrProfile.work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : "";
    hrProfile.project = req.body.project ? JSON.stringify(req.body.project) : "";
    hrProfile.education = req.body.education ? JSON.stringify(req.body.education) : "";
    hrProfile.skills = req.body.skills ? JSON.stringify(req.body.skills) : "";
    hrProfile.user_id = currentUserId;
    hrProfile.tenant_id = tenantId;
    hrProfile.created_by_id = currentUserId;

    await axios.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, [hrProfile]);

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
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;
    const hrProfile: HrProfile = req.body;

    hrProfile.work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : "";
    hrProfile.project = req.body.project ? JSON.stringify(req.body.project) : "";
    hrProfile.education = req.body.education ? JSON.stringify(req.body.education) : "";
    hrProfile.skills = req.body.skills ? JSON.stringify(req.body.skills) : "";

    const data = {
      "add": {
        "doc": {
          "id": hrProfile.id,
          ...hrProfile
        }
      }
    };
    await axios.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, data);

    res.status(HttpStatusCode.OK).json({ message: "Profile Updated Successfully" });
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
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
const hrProfileDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;

    let docId = req.params.id;
    if (!docId) {
      throw new HttpBadRequest("Profile Id is required");
    }
    const queryToDeleteDoc = `id:${docId}`;
    console.log(queryToDeleteDoc)
    const data = {
      delete: {
        id: docId,
      },
    };
    const response = await axios.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, data);

    res.status(HttpStatusCode.OK).json({ message: "Profile Deleted Successfully" });
  } catch (error) {
    next(error);
  }
};

async function createSolrCore(tenantId: number) {
  try {
    const coreName = SOLR_CORE_PREFIX! + tenantId;
    const configSet = "talent_management_configs";

    const createCoreUrl = `${SOLR_BASE_URL}/admin/cores?action=CREATE&name=${coreName}&configSet=${configSet}&wt=json`;

    const response = await axios.post(createCoreUrl);
    return response.data;
  } catch (error) {
    throw new HttpInternalServerError(`Something went wrong!`);
  }
}

export { getHrProfileList, hrProfileAdd, hrProfileDelete, hrProfilePhotoUpload, hrProfileUpdate, createSolrCore };


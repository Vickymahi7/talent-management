import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { HttpStatusCode } from "../types/enums";
import { HttpNotFound, HttpBadRequest } from "../types/errors";
import HrProfile from "../models/HrProfile";
import dotenv from "dotenv";
import {
  validatePhotoUpload,
  validateAddHrProfileInput,
  validateUpdateHrProfileInput,
  validateResumeUpload,
} from "../validations/validations";
import { uploadFile } from "../utils/s3";
dotenv.config();

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
 *         profile_title:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         middle_name:
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
 *         location:
 *           type: string
 *         ctc:
 *           type: string
 *         experience_month:
 *           type: number
 *         experience_year:
 *           type: number
 *         objective:
 *           type: string
 *         summary:
 *           type: string
 *         note:
 *           type: string
 *         gender:
 *           type: string
 *         date_of_birth:
 *           type: string
 *         resume_url:
 *           type: string
 *         photo_url:
 *           type: string
 *         buiding_number:
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
 *         status:
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
 *             position:
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
 *         docs:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             path:
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
 *         name: email_id
 *         description: search Email Id
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         description: Search skills
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const getHrProfileList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email_id, skills } = req.query;
    const field1 = `email_id:${email_id}`;
    const field2 = `skills:${skills}`;
    let query = "*:*";
    if (email_id && skills) {
      query = `${field1} AND ${field2}`;
    } else if (email_id || skills) {
      query = email_id ? `${field1}` : field2;
    }

    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;

    let response = await axios.get(`${SOLR_BASE_URL}/${solrCore}/select`, {
      params: { q: query, "q.op": "AND" },
    });
    const { numFound } = response.data.response;

    const hrProfileList = response.data.response.docs.map((data: any) => ({
      ...data,
      work_experience: data.work_experience?.map((item) => JSON.parse(item)),
      project: data.project?.map((item) => JSON.parse(item)),
      education: data.education?.map((item) => JSON.parse(item)),
      docs: data.docs?.map((item) => JSON.parse(item)),
    }));

    res.status(HttpStatusCode.OK).json({ numFound, hrProfileList });
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
export const hrProfilePhotoUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;
    const userId = req.headers.userId;
    const id = req.body.id;
    const file = req.file;
    validatePhotoUpload(req);

    const fileBuffer = file?.buffer;
    const uploadLocation = process.env.AWS_PROFILE_PIC_PATH + id;
    const fileUrl = `${process.env.AWS_SAVE_URL!}/${uploadLocation}`;

    const uploadRes = await uploadFile(
      fileBuffer,
      uploadLocation,
      file?.mimetype
    );

    let updatePayload = {
      id: id,
      user_id: userId,
      photo_url: { set: fileUrl },
    };

    await axios.patch(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, {
      add: { doc: updatePayload },
      commit: {},
    });

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Photo Uploaded Successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/resumeupload:
 *   post:
 *     summary: Upload HR Profile Resume
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
export const hrProfileResumeUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;
    const userId = req.headers.userId;
    const id = req.body.id;
    const file = req.file;
    validateResumeUpload(req);

    const fileBuffer = file?.buffer;
    const uploadLocation = process.env.AWS_RESUME_PATH + id;
    const fileUrl = `${process.env.AWS_SAVE_URL!}/${uploadLocation}`;

    const uploadRes = await uploadFile(
      fileBuffer,
      uploadLocation,
      file?.mimetype
    );

    let updatePayload = {
      id: id,
      user_id: userId,
      resume_url: { set: fileUrl },
    };

    await axios.patch(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, {
      add: { doc: updatePayload },
      commit: {},
    });

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Resume Uploaded Successfully",
    });
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
 *               hr_profile: 1
 *               hr_profile_type_id: null
 *               profile_title: Java Profile
 *               first_name: Vignesh
 *               last_name: Vicky
 *               middle_name:
 *               email_id: demouser@demo.com
 *               alternate_email_id: null
 *               mobile: 9874512300
 *               alternate_mobile:
 *               phone:
 *               office_phone:
 *               location:
 *               ctc:
 *               experience_month: 1
 *               experience_year: 6
 *               objective: Passionate and Hard working individual and a great Team player
 *               summary: This is a resume summary
 *               note:
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
 *               status:
 *               status_id: 1
 *               user_id: 1
 *               active: true
 *               skills:
 *                 - Java
 *                 - Javascript
 *               work_experience:
 *                 - company: Test IT
 *                   position: Software Developer
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
 *               docs:
 *                 - title: Degree Certificate
 *                   path:
 *     responses:
 *       201:
 *         description: Created.
 */
export const hrProfileAdd = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateAddHrProfileInput(req);
    const currentUserId = req.headers.userId?.toString();
    const tenantId = req.headers.tenantId?.toString();
    const solrCore = SOLR_CORE_PREFIX! + tenantId;

    const { id, ...otherReqData } = req.body;

    const hrProfile = new HrProfile(otherReqData);

    hrProfile.user_id = currentUserId;
    hrProfile.tenant_id = tenantId;
    hrProfile.created_by_id = currentUserId;
    hrProfile.last_updated_dt = new Date();

    await axios.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, [
      hrProfile,
    ]);

    res.status(HttpStatusCode.CREATED).json({
      status: HttpStatusCode.CREATED,
      message: "Profile Added Successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/update:
 *   patch:
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
 *               profile_title: Java Profile
 *               first_name: Vignesh
 *               last_name: Vicky
 *               middle_name:
 *               email_id: demouser@demo.com
 *               alternate_email_id: null
 *               mobile: 9874512300
 *               alternate_mobile:
 *               phone:
 *               office_phone:
 *               location:
 *               ctc:
 *               experience_month: 1
 *               experience_year: 6
 *               objective: Passionate and Hard working individual and a great Team player
 *               summary: This is a resume summary
 *               note:
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
 *               status:
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
 *                   position: Software Developer
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
 *               docs:
 *                 - title: Degree Certificate
 *                   path:
 *     responses:
 *       200:
 *         description: OK.
 */
export const hrProfileUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateUpdateHrProfileInput(req);
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;
    const { id, user_id, _version_, ...updateValues } = req.body;

    updateValues.last_updated_dt = new Date();

    const hrProfile = new HrProfile(updateValues);
    let updatePayload = {
      id: id,
      user_id: user_id,
    };
    for (const prop in updateValues) {
      updatePayload[prop] = { set: hrProfile[prop] };
    }

    await axios.patch(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, {
      add: { doc: updatePayload },
      commit: {},
    });

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Profile Updated Successfully",
    });
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
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const hrProfileView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let id = req.params.id;
    if (!id) {
      throw new HttpBadRequest("Id is required");
    }

    let query = `id:${id}`;

    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;

    let response = await axios.get(`${SOLR_BASE_URL}/${solrCore}/select`, {
      params: { q: query, "q.op": "AND" },
    });

    if (response.data.response.docs.length > 0) {
      const hrProfile = response.data.response.docs[0];
      hrProfile.work_experience = hrProfile.work_experience?.map((item) =>
        JSON.parse(item)
      );
      hrProfile.project = hrProfile.project?.map((item) => JSON.parse(item));
      hrProfile.education = hrProfile.education?.map((item) =>
        JSON.parse(item)
      );
      hrProfile.docs = hrProfile.docs?.map((item) => JSON.parse(item));

      return res.status(HttpStatusCode.OK).json({ hrProfile });
    } else {
      throw new HttpNotFound("Profile Not Found");
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
 *         type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const hrProfileDelete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;

    let docId = req.params.id;
    if (!docId) {
      throw new HttpBadRequest("Id is required");
    }
    await axios.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, {
      delete: {
        id: docId,
      },
    });

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Profile Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

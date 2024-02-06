import axios from "axios";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { HttpStatusCode, ProfileStatus, UserTypes } from "../enums/enums";
import {
  getHrProfileFromSolr,
  hrProfileSolrUpdate,
} from "../helperFunctions/hrProfleFunctions";
import HrProfile from "../models/HrProfile";
import QueryParams from "../types/QueryParams";
import { HttpBadRequest, HttpNotFound } from "../types/errors";
import { deleteFile, uploadFile } from "../utils/s3";
import {
  validateAddHrProfileInput,
  validateDocUpload,
  validatePhotoUpload,
  validateResumeUpload,
  validateUpdateHrProfileInput,
} from "../validations/validations";
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
 *         position:
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
 *             type: object
 *             properties:
 *               skill: string
 *               experience_month: number
 *               experience_year: number
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
 *   name: Profile
 *   description: APIs for Managing Profiles
 * /hrprofile/list:
 *   get:
 *     summary: List all Profiles
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchText
 *         description: To search Profile Title, Email Id or Skill or Summary
 *         schema:
 *           type: string
 *       - in: query
 *         name: status_id
 *         description: To search based on Status Id
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
    const currentUserId = req.headers.userId?.toString();
    const currentUserTypeId = req.headers.userTypeId?.toString();
    const { searchText, status_id, rows, start, sortBy, sortDirection } =
      req.query;
    let query = "*:*";
    if (searchText) {
      query = `profile_title:"${searchText}" OR email_id:"${searchText}" OR skills:"${searchText}" OR summary:"${searchText}"`;
    }
    let statusQuery = "";
    if (status_id) {
      const statusIds = status_id as string[];
      statusQuery = statusIds
        .map((element) => `status_id:${element}`)
        .join(" AND ");
    }

    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;

    const queryParams: QueryParams = {
      q: query,
      fq: statusQuery,
      rows: rows as string,
      start: start as string,
      // default sorting is by 'created_dt desc'
      sort:
        (sortBy?.toString() ?? "created_dt") +
        " " +
        (sortDirection?.toString() ?? "desc"),
    };

    // For User Type "User" - Only show Profiles for the User
    if (parseInt(currentUserTypeId!) == UserTypes.USR)
      queryParams.fq = `created_by_id:${currentUserId}`;

    const { total, hrProfileList } = await getHrProfileFromSolr(
      solrCore,
      queryParams
    );

    res.status(HttpStatusCode.OK).json({ start, total, hrProfileList });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/user/list:
 *   get:
 *     summary: List all Profiles for the logged in User
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK.
 */
export const getUserHrProfileList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.headers.userId?.toString();
    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;

    const queryParams: QueryParams = {
      q: "*:*",
      fq: `user_id:${currentUserId}`,
      sort: "created_dt desc",
    };

    const { total, hrProfileList } = await getHrProfileFromSolr(
      solrCore,
      queryParams
    );

    res.status(HttpStatusCode.OK).json({ total, hrProfileList });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * tags:
 *   name: Profile
 * /hrprofile/talentpool/list:
 *   get:
 *     summary: Search Profiles in Talent Pool
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchText
 *         description: To search Profile Title, Email Id or Skill or Summary
 *         schema:
 *           type: string
 *       - in: query
 *         name: status_id
 *         description: To search based on Status Id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK.
 */
export const getTalentPoolList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.headers.userId?.toString();
    const currentUserTypeId = req.headers.userTypeId?.toString();
    const { searchText, status_id, rows, start, sortBy, sortDirection } =
      req.query;
    let query = "*:*";
    // get profiles which dont have Draft Status
    const noDraftCondition = ` NOT status_id:${ProfileStatus.DRAFT}`;
    if (searchText) {
      query = `profile_title:"${searchText}" OR email_id:"${searchText}" OR skills:"${searchText}" OR summary:"${searchText}"`;
    }
    query = query.concat(noDraftCondition);
    let statusQuery = "";
    if (status_id) {
      const statusIds = status_id as string[];
      statusQuery = statusIds
        .map((element) => `status_id:${element}`)
        .join(" AND ");
    }

    const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;

    const queryParams: QueryParams = {
      q: query,
      fq: statusQuery,
      rows: rows as string,
      start: start as string,
      // default sorting is by 'created_dt desc'
      sort:
        (sortBy?.toString() ?? "created_dt") +
        " " +
        (sortDirection?.toString() ?? "desc"),
    };

    // For User Type "User" - Only show Profiles created by them
    if (parseInt(currentUserTypeId!) == UserTypes.USR)
      queryParams.fq = `created_by_id:${currentUserId}`;

    const { total, hrProfileList } = await getHrProfileFromSolr(
      solrCore,
      queryParams
    );

    res.status(HttpStatusCode.OK).json({ start, total, hrProfileList });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/photoupload:
 *   post:
 *     summary: Upload Profile Picture
 *     tags: [Profile]
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

    req.body.photo_url = fileUrl;

    const response = await hrProfileSolrUpdate(req, req.body);

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Photo Uploaded",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/resumeupload:
 *   post:
 *     summary: Upload Profile Resume
 *     tags: [Profile]
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

    req.body.resume_url = fileUrl;

    const response = await hrProfileSolrUpdate(req, req.body);

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Resume Uploaded",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/deleteresume:
 *   delete:
 *     summary: Delete Profile Resume
 *     tags: [Profile]
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
 *         description: Ok.
 *     x-swagger-router-controller: "Default"
 */
export const deleteHrProfileResume = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    if (id) {
      const uploadLocation = process.env.AWS_RESUME_PATH + id;

      const uploadRes = await deleteFile(uploadLocation);

      if (uploadRes.$metadata.httpStatusCode == HttpStatusCode.OK) {
        const data = { id, resume_url: null };
        const response = await hrProfileSolrUpdate(req, data);

        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "Resume Deleted",
        });
      } else {
        throw new HttpBadRequest("Error deleting file");
      }
    } else {
      throw new HttpBadRequest("File cannot be found");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/docupload:
 *   post:
 *     summary: Upload Profile Documents
 *     tags: [Profile]
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
 *               title:
 *                 type: string
 *               docs:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *             required:
 *               - id
 *               - title
 *               - docs
 *               - file
 *     responses:
 *       200:
 *         description: Ok.
 *     x-swagger-router-controller: "Default"
 */
export const hrProfileDocUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const file = req.file;
    validateDocUpload(req);
    const { title } = req.body;

    // docs will be a JSON string, because of FormData
    const docs = req.body.docs ? JSON.parse(req.body.docs) : [];

    const docId = uuidv4();
    const fileBuffer = file?.buffer;
    const fileExtension = file?.originalname.split(".").pop();
    const uploadLocation =
      process.env.AWS_DOC_PATH! + docId + "." + fileExtension;
    const fileUrl = `${process.env.AWS_SAVE_URL!}/${uploadLocation}`;

    const uploadDoc = await uploadFile(
      fileBuffer,
      uploadLocation,
      file?.mimetype
    );
    const newDoc = {
      id: docId,
      title: title,
      path: fileUrl,
    };

    docs.push(newDoc);
    req.body.docs = docs;

    const response = await hrProfileSolrUpdate(req, req.body);

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Profile Updated",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /hrprofile/deletedoc:
 *   patch:
 *     summary: Delete Profile Document
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: sting
 *               doc_id:
 *                 type: string
 *               path:
 *                 type: string
 *             required:
 *               - id
 *               - doc_id
 *               - path
 *             example:
 *               id:
 *               doc_id: 1
 *               path:
 *     responses:
 *       200:
 *         description: OK.
 */
export const deleteHrProfileDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { doc_id, path } = req.body;

    if (doc_id) {
      const fileExtension = path?.split(".").pop();
      const uploadLocation =
        process.env.AWS_DOC_PATH! + doc_id + "." + fileExtension;

      const uploadRes = await deleteFile(uploadLocation);

      if (uploadRes.$metadata.httpStatusCode == HttpStatusCode.OK) {
        const response = await hrProfileSolrUpdate(req, req.body);

        res.status(HttpStatusCode.OK).json({
          status: HttpStatusCode.OK,
          message: "Resume Deleted",
        });
      } else {
        throw new HttpBadRequest("Error deleting file");
      }
    } else {
      throw new HttpBadRequest("File cannot be found");
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
 *     tags: [Profile]
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
 *               position: Software Developer
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
 *                 - skill: Java
 *                   experience_month: 4
 *                   experience_year: 2014
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

    hrProfile.user_id = req.body.is_current_user
      ? currentUserId
      : req.body.user_id;
    hrProfile.tenant_id = tenantId;
    hrProfile.created_by_id = currentUserId;
    hrProfile.status_id = ProfileStatus.DRAFT;
    hrProfile.created_dt = new Date();
    hrProfile.last_updated_dt = new Date();

    await axios.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, [
      hrProfile,
    ]);

    res.status(HttpStatusCode.CREATED).json({
      status: HttpStatusCode.CREATED,
      message: "Profile Added",
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
 *     tags: [Profile]
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
 *               position: Software Developer
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
 *                 - skill: Java
 *                   experience_month: 4
 *                   experience_year: 2014
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

    const response = await hrProfileSolrUpdate(req, req.body);

    res.status(HttpStatusCode.OK).json({
      status: HttpStatusCode.OK,
      message: "Profile Updated",
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
 *     tags: [Profile]
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
    const id = req.params.id;
    const tenantId = parseInt(req.headers.tenantId!.toString());
    if (!id) {
      throw new HttpBadRequest("Id is required");
    }
    const query = `id:${id}`;
    const solrCore = SOLR_CORE_PREFIX! + tenantId;

    const queryParams: QueryParams = {
      q: query,
    };
    const { hrProfileList } = await getHrProfileFromSolr(solrCore, queryParams);

    if (hrProfileList.length > 0) {
      const hrProfile = hrProfileList[0];

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
 *     tags: [Profile]
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
      message: "Profile Deleted",
    });
  } catch (error) {
    next(error);
  }
};

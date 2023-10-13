"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSolrCore = exports.hrProfileUpdate = exports.hrProfilePhotoUpload = exports.hrProfileDelete = exports.hrProfileAdd = exports.getHrProfileList = void 0;
const axios_1 = __importDefault(require("axios"));
const httpStatusCode_1 = __importDefault(require("../utils/httpStatusCode"));
const errors_1 = require("../utils/errors");
const hrProfileList_json_1 = __importDefault(require("../models/hrProfileList.json"));
const dotenv_1 = require("dotenv");
const validations_1 = require("../validations/validations");
(0, dotenv_1.config)();
let hrProfileList = hrProfileList_json_1.default;
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
const getHrProfileList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const solrCore = SOLR_CORE_PREFIX + req.headers.tenantId;
        const params = {
            q: '*:*',
            wt: 'json',
        };
        let response = yield axios_1.default.get(`${SOLR_BASE_URL}/${solrCore}/select`, { params });
        const hrProfileList = response.data.response.docs.map((data) => (Object.assign(Object.assign({}, data), { work_experience: data.work_experience ? JSON.parse(data.work_experience) : [], project: data.project ? JSON.parse(data.project) : [], education: data.education ? JSON.parse(data.education) : [], skills: data.skills ? JSON.parse(data.skills) : [] })));
        res.status(httpStatusCode_1.default.OK).json({ hrProfileList });
    }
    catch (error) {
        next(error);
    }
});
exports.getHrProfileList = getHrProfileList;
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
const hrProfilePhotoUpload = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validations_1.validatePhotoUpload)(req);
        const file = req.file;
        const hrProfileIndex = hrProfileList.findIndex((data) => data.hr_profile_id == req.body.id);
        if (hrProfileIndex !== -1) {
            const filePath = file ? file.path : "";
            hrProfileList[hrProfileIndex] = Object.assign(Object.assign({}, hrProfileList[hrProfileIndex]), { photo_url: filePath });
            res.status(httpStatusCode_1.default.OK).json({ message: "Photo Uploaded Successfully" });
        }
        else {
            throw new errors_1.HttpNotFound("Profile Not Found");
        }
    }
    catch (error) {
        next(error);
    }
});
exports.hrProfilePhotoUpload = hrProfilePhotoUpload;
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
const hrProfileAdd = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validations_1.validateAddHrProfileInput)(req);
        const currentUserId = req.headers.userId;
        const tenantId = req.headers.tenantId;
        const solrCore = SOLR_CORE_PREFIX + tenantId;
        const hrProfile = req.body;
        hrProfile.work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : "";
        hrProfile.project = req.body.project ? JSON.stringify(req.body.project) : "";
        hrProfile.education = req.body.education ? JSON.stringify(req.body.education) : "";
        hrProfile.skills = req.body.skills ? JSON.stringify(req.body.skills) : "";
        hrProfile.user_id = currentUserId;
        hrProfile.tenant_id = tenantId;
        hrProfile.created_by_id = currentUserId;
        yield axios_1.default.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, [hrProfile]);
        res.status(httpStatusCode_1.default.CREATED).json({ message: "Profile Added Successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.hrProfileAdd = hrProfileAdd;
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
const hrProfileUpdate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validations_1.validateUpdateHrProfileInput)(req);
        const solrCore = SOLR_CORE_PREFIX + req.headers.tenantId;
        const hrProfile = req.body;
        hrProfile.work_experience = req.body.work_experience ? JSON.stringify(req.body.work_experience) : "";
        hrProfile.project = req.body.project ? JSON.stringify(req.body.project) : "";
        hrProfile.education = req.body.education ? JSON.stringify(req.body.education) : "";
        hrProfile.skills = req.body.skills ? JSON.stringify(req.body.skills) : "";
        const data = {
            "add": {
                "doc": Object.assign({ "id": hrProfile.id }, hrProfile)
            }
        };
        yield axios_1.default.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, data);
        res.status(httpStatusCode_1.default.OK).json({ message: "Profile Updated Successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.hrProfileUpdate = hrProfileUpdate;
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
const hrProfileDelete = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const solrCore = SOLR_CORE_PREFIX + req.headers.tenantId;
        let docId = req.params.id;
        if (!docId) {
            throw new errors_1.HttpBadRequest("Profile Id is required");
        }
        const queryToDeleteDoc = `id:${docId}`;
        console.log(queryToDeleteDoc);
        const data = {
            delete: {
                id: docId,
            },
        };
        const response = yield axios_1.default.post(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, data);
        res.status(httpStatusCode_1.default.OK).json({ message: "Profile Deleted Successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.hrProfileDelete = hrProfileDelete;
function createSolrCore(tenantId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const coreName = SOLR_CORE_PREFIX + tenantId;
            const configSet = "talent_management_configs";
            const createCoreUrl = `${SOLR_BASE_URL}/admin/cores?action=CREATE&name=${coreName}&configSet=${configSet}&wt=json`;
            const response = yield axios_1.default.post(createCoreUrl);
            return response.data;
        }
        catch (error) {
            throw new errors_1.HttpInternalServerError(`Something went wrong!`);
        }
    });
}
exports.createSolrCore = createSolrCore;

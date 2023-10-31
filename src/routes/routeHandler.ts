import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import multer from 'multer';
import swagger from '../swagger/swagger';
import userTypes from '../utils/userTypes';
import { checkUserAuth, requireUsers } from '../middlewares/authMiddleware';
import * as tenantController from '../controllers/tenantController';
import * as userController from '../controllers/userController';
import * as hrProfileController from '../controllers/hrProfileController';

const router: Router = express.Router();
const upload = multer({ dest: path.join('src', 'uploads') });
const { SUPER_ADMIN, ADMIN, HR_USER } = userTypes;

// Swagger Docs Route
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swagger));

// Login Routes
router.post('/login', userController.userLogin);

router.use(checkUserAuth);
// Tenant Routes
router.post('/tenant/add', requireUsers([SUPER_ADMIN]), tenantController.tenantAdd);
router.get('/tenant/list', requireUsers([SUPER_ADMIN]), tenantController.getTenantList);
router.put('/tenant/update', requireUsers([SUPER_ADMIN]), tenantController.tenantUpdate);
router.get('/tenant/view/:id', requireUsers([SUPER_ADMIN]), tenantController.tenantView);
router.delete('/tenant/delete/:id', requireUsers([SUPER_ADMIN]), tenantController.tenantDelete);

// User Routes
router.post('/user/add', requireUsers([SUPER_ADMIN, ADMIN]), userController.userAdd);
router.get('/user/list', requireUsers([SUPER_ADMIN, ADMIN]), userController.getUserList);
router.put('/user/update', requireUsers([SUPER_ADMIN, ADMIN]), userController.userUpdate);
router.get('/user/view/:id', requireUsers([SUPER_ADMIN, ADMIN]), userController.userView);
router.delete('/user/delete/:id', requireUsers([SUPER_ADMIN, ADMIN]), userController.userDelete);

// HR Profile Routes
router.get('/hrprofile/list', requireUsers([ADMIN, HR_USER]), hrProfileController.getHrProfileList);
router.post('/hrprofile/photoupload', requireUsers([ADMIN, HR_USER]), upload.single('file'), hrProfileController.hrProfilePhotoUpload);
router.post('/hrprofile/add', requireUsers([ADMIN, HR_USER]), hrProfileController.hrProfileAdd);
router.put('/hrprofile/update', requireUsers([ADMIN, HR_USER]), hrProfileController.hrProfileUpdate);
router.delete('/hrprofile/delete/:id', requireUsers([ADMIN, HR_USER]), hrProfileController.hrProfileDelete);

export default router;
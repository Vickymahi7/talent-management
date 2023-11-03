import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import multer from 'multer';
import swagger from '../swagger/swagger';
import userTypes from '../utils/userTypes';
import { checkUserAuth, requireUsers } from '../middlewares/authMiddleware';
import * as tenant from '../controllers/tenantController';
import * as user from '../controllers/userController';
import * as hrProfile from '../controllers/hrProfileController';

const router: Router = express.Router();
const upload = multer({ dest: path.join('src', 'uploads') });
const { SUPER_ADMIN, ADMIN, HR_USER } = userTypes;

// Swagger Docs Route
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swagger));

// Login Routes
router.post('/login', user.userLogin);

router.use(checkUserAuth);
// Tenant Routes
router.post('/tenant/add', requireUsers([SUPER_ADMIN]), tenant.tenantAdd);
router.get('/tenant/list', requireUsers([SUPER_ADMIN]), tenant.getTenantList);
router.put('/tenant/update', requireUsers([SUPER_ADMIN]), tenant.tenantUpdate);
router.get('/tenant/view/:id', requireUsers([SUPER_ADMIN]), tenant.tenantView);
router.delete('/tenant/delete/:id', requireUsers([SUPER_ADMIN]), tenant.tenantDelete);

// User Routes
router.post('/user/add', requireUsers([SUPER_ADMIN, ADMIN]), user.userAdd);
router.get('/user/list', requireUsers([SUPER_ADMIN, ADMIN]), user.getUserList);
router.put('/user/update', requireUsers([SUPER_ADMIN, ADMIN]), user.userUpdate);
router.get('/user/view/:id', requireUsers([SUPER_ADMIN, ADMIN]), user.userView);
router.delete('/user/delete/:id', requireUsers([SUPER_ADMIN, ADMIN]), user.userDelete);

// HR Profile Routes
router.get('/hrprofile/list', requireUsers([ADMIN, HR_USER]), hrProfile.getHrProfileList);
router.post('/hrprofile/photoupload', requireUsers([ADMIN, HR_USER]), upload.single('file'), hrProfile.hrProfilePhotoUpload);
router.post('/hrprofile/add', requireUsers([ADMIN, HR_USER]), hrProfile.hrProfileAdd);
router.put('/hrprofile/update', requireUsers([ADMIN, HR_USER]), hrProfile.hrProfileUpdate);
router.get('/hrprofile/view/:id', requireUsers([ADMIN, HR_USER]), hrProfile.hrProfileView);
router.delete('/hrprofile/delete/:id', requireUsers([ADMIN, HR_USER]), hrProfile.hrProfileDelete);

export default router;
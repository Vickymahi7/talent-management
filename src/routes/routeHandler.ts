import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import multer from 'multer';
import swagger from '../swagger/swagger';
import checkUserAuth from '../middlewares/authMiddleware';
import * as userController from '../controllers/userController';
import * as hrProfileController from '../controllers/hrProfileController';

const router: Router = express.Router();
const upload = multer({ dest: path.join('src', 'uploads') });

// Swagger Docs Route
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swagger));

// Login Routes
router.post('/login', userController.userLogin);
router.post('/signup', userController.userAdd);

router.use(checkUserAuth);
// User Routes
router.get('/user/list', userController.getUserList);
router.put('/user/update', userController.userUpdate);
router.get('/user/view/:id', userController.userView);
router.delete('/user/delete/:id', userController.userDelete);

// HR Profile Routes
router.get('/hrprofile/list', hrProfileController.getHrProfileList);
router.post('/hrprofile/photoupload', upload.single('file'), hrProfileController.hrProfilePhotoUpload);
router.post('/hrprofile/add', hrProfileController.hrProfileAdd);
router.put('/hrprofile/update', hrProfileController.hrProfileUpdate);
router.get('/hrprofile/view/:id', hrProfileController.hrProfileView);
router.delete('/hrprofile/delete/:id', hrProfileController.hrProfileDelete);

export default router;
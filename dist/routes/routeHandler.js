"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const swagger_1 = __importDefault(require("../swagger/swagger"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const tenantController = __importStar(require("../controllers/tenantController"));
const userController = __importStar(require("../controllers/userController"));
const hrProfileController = __importStar(require("../controllers/hrProfileController"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: path_1.default.join('src', 'uploads') });
// Swagger Docs Route
router.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
// Login Routes
router.post('/login', userController.userLogin);
router.use(authMiddleware_1.default);
// Tenant Routes
router.post('/tenant/add', tenantController.tenantAdd);
router.get('/tenant/list', tenantController.getTenantList);
router.put('/tenant/update', tenantController.tenantUpdate);
router.get('/tenant/view/:id', tenantController.tenantView);
router.delete('/tenant/delete/:id', tenantController.tenantDelete);
// User Routes
router.post('/user/add', userController.userAdd);
router.get('/user/list', userController.getUserList);
router.put('/user/update', userController.userUpdate);
router.get('/user/view/:id', userController.userView);
router.delete('/user/delete/:id', userController.userDelete);
// HR Profile Routes
router.get('/hrprofile/list', hrProfileController.getHrProfileList);
router.post('/hrprofile/photoupload', upload.single('file'), hrProfileController.hrProfilePhotoUpload);
router.post('/hrprofile/add', hrProfileController.hrProfileAdd);
router.put('/hrprofile/update', hrProfileController.hrProfileUpdate);
router.delete('/hrprofile/delete/:id', hrProfileController.hrProfileDelete);
exports.default = router;

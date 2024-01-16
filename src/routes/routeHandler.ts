import express, { Router } from "express";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import * as hrProfile from "../controllers/hrProfileController";
import * as tenant from "../controllers/tenantController";
import * as user from "../controllers/userController";
import { UserTypes } from "../enums/enums";
import { checkUserAuth, requireUsers } from "../middlewares/authMiddleware";
import swagger from "../utils/swagger";

const router: Router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { SAD, ADM, HRU, USR } = UserTypes;

// Swagger Docs Route
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));

// Public Routes
router.post("/login", user.userLogin);
router.get("/user/activationdetail/:token", user.getUserActivationDetails);
router.post("/user/activate", user.activateUser);
router.post("/user/inviteduser/register", user.registerInvitedUser);
router.post("/user/inviteduser/decode", user.getInvitedUserDetails);
router.post("/user/forgotpassword", user.sendForgotPasswordMail);
router.get("/user/resetpassword/decode/:key", user.decodeResetPasswordDetails);
router.post("/user/updatepassword", user.updatePassword);

// Protected Routes
router.use(checkUserAuth);
// Tenant Routes
router.post("/tenant/add", requireUsers([SAD]), tenant.tenantAdd);
router.get("/tenant/list", requireUsers([SAD]), tenant.getTenantList);
router.patch("/tenant/update", requireUsers([SAD, ADM]), tenant.tenantUpdate);
router.get("/tenant/view/:id", requireUsers([SAD]), tenant.tenantView);
router.delete("/tenant/delete/:id", requireUsers([SAD]), tenant.tenantDelete);
router.get(
  "/tenantsetting/view",
  requireUsers([SAD, ADM, USR]),
  tenant.getTenantSettings
);
router.post(
  "/tenant/logoupload",
  requireUsers([SAD, ADM, HRU, USR]),
  upload.single("file"),
  tenant.tenantLogoUpload
);

// User Routes
router.post(
  "/user/resendactivation/:id",
  requireUsers([SAD, ADM, USR]),
  user.resendActivationMail
);
router.post("/user/add", requireUsers([SAD, ADM, USR]), user.userAdd);
router.get("/user/list", requireUsers([SAD, ADM, USR]), user.getUserList);
router.patch("/user/update", requireUsers([SAD, ADM, USR]), user.userUpdate);
router.get("/user/view/:id", requireUsers([SAD, ADM, USR]), user.userView);
router.get(
  "/user/userprofile",
  requireUsers([SAD, ADM, USR]),
  user.getUserProfileDetails
);
router.delete(
  "/user/delete/:id",
  requireUsers([SAD, ADM, USR]),
  user.userDelete
);
router.post(
  "/user/photoupload",
  requireUsers([SAD, ADM, USR]),
  upload.single("file"),
  user.userProfilePhotoUpload
);
router.post("/user/changepassword", user.changeExistingPassword);
router.post(
  "/user/aduserinvite",
  requireUsers([SAD, ADM, USR]),
  user.inviteAdUsers
);
router.get(
  "/standardprivilege/list/:userId",
  requireUsers([SAD, ADM, USR]),
  user.getStandardPrivileges
);
router.get("/usermenuprivilege/list", user.getUserMenuPrivileges);
router.post(
  "/usermenuprivilege/statechange",
  requireUsers([SAD, ADM, USR]),
  user.userMenuPrivilegeStateChange
);
router.get(
  "/usermenuprivilege/routecheck",
  requireUsers([SAD, ADM, USR]),
  user.canUserAccess
);

// Profile Routes
router.get(
  "/hrprofile/list",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.getHrProfileList
);
router.get(
  "/hrprofile/user/list",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.getUserHrProfileList
);
router.get(
  "/hrprofile/talentpool/list",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.getTalentPoolList
);
router.post(
  "/hrprofile/photoupload",
  requireUsers([SAD, ADM, HRU, USR]),
  upload.single("file"),
  hrProfile.hrProfilePhotoUpload
);
router.post(
  "/hrprofile/resumeupload",
  requireUsers([SAD, ADM, HRU, USR]),
  upload.single("file"),
  hrProfile.hrProfileResumeUpload
);
router.delete(
  "/hrprofile/deleteresume/:id",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.deleteHrProfileResume
);
router.post(
  "/hrprofile/docupload",
  requireUsers([SAD, ADM, HRU, USR]),
  upload.single("file"),
  hrProfile.hrProfileDocUpload
);
router.patch(
  "/hrprofile/deletedoc",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.deleteHrProfileDoc
);
router.post(
  "/hrprofile/add",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.hrProfileAdd
);
router.patch(
  "/hrprofile/update",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.hrProfileUpdate
);
router.get(
  "/hrprofile/view/:id",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.hrProfileView
);
router.delete(
  "/hrprofile/delete/:id",
  requireUsers([SAD, ADM, HRU, USR]),
  hrProfile.hrProfileDelete
);

export default router;

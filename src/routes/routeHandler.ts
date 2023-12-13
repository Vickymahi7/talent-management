import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import swagger from "../utils/swagger";
import { UserTypes } from "../enums/enums";
import { checkUserAuth, requireUsers } from "../middlewares/authMiddleware";
import * as tenant from "../controllers/tenantController";
import * as user from "../controllers/userController";
import * as hrProfile from "../controllers/hrProfileController";

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

// Protected Routes
router.use(checkUserAuth);
// Tenant Routes
router.post("/tenant/add", requireUsers([SAD]), tenant.tenantAdd);
router.get("/tenant/list", requireUsers([SAD]), tenant.getTenantList);
router.patch("/tenant/update", requireUsers([SAD]), tenant.tenantUpdate);
router.get("/tenant/view/:id", requireUsers([SAD]), tenant.tenantView);
router.delete("/tenant/delete/:id", requireUsers([SAD]), tenant.tenantDelete);

// User Routes
router.post(
  "/user/resendactivation/:id",
  requireUsers([SAD, ADM]),
  user.resendActivationMail
);
router.post("/user/add", requireUsers([SAD, ADM]), user.userAdd);
router.get("/user/list", requireUsers([SAD, ADM]), user.getUserList);
router.patch("/user/update", requireUsers([SAD, ADM]), user.userUpdate);
router.get("/user/view/:id", requireUsers([SAD, ADM]), user.userView);
router.delete("/user/delete/:id", requireUsers([SAD, ADM]), user.userDelete);
router.post("/user/aduserinvite", requireUsers([ADM, HRU]), user.inviteAdUsers);

// HR Profile Routes
router.get(
  "/hrprofile/list",
  requireUsers([ADM, HRU, USR]),
  hrProfile.getHrProfileList
);
router.post(
  "/hrprofile/photoupload",
  requireUsers([ADM, HRU, USR]),
  upload.single("file"),
  hrProfile.hrProfilePhotoUpload
);
router.post(
  "/hrprofile/resumeupload",
  requireUsers([ADM, HRU, USR]),
  upload.single("file"),
  hrProfile.hrProfileResumeUpload
);
router.delete(
  "/hrprofile/deleteresume/:id",
  requireUsers([ADM, HRU, USR]),
  hrProfile.deleteHrProfileResume
);
router.post(
  "/hrprofile/docupload",
  requireUsers([ADM, HRU, USR]),
  upload.single("file"),
  hrProfile.hrProfileDocUpload
);
router.patch(
  "/hrprofile/deletedoc",
  requireUsers([ADM, HRU, USR]),
  hrProfile.deleteHrProfileDoc
);
router.post(
  "/hrprofile/add",
  requireUsers([ADM, HRU, USR]),
  hrProfile.hrProfileAdd
);
router.patch(
  "/hrprofile/update",
  requireUsers([ADM, HRU, USR]),
  hrProfile.hrProfileUpdate
);
router.get(
  "/hrprofile/view/:id",
  requireUsers([ADM, HRU, USR]),
  hrProfile.hrProfileView
);
router.delete(
  "/hrprofile/delete/:id",
  requireUsers([ADM, HRU, USR]),
  hrProfile.hrProfileDelete
);

export default router;

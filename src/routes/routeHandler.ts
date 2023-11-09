import express, { Router } from "express";
import swaggerUi from "swagger-ui-express";
import path from "path";
import multer from "multer";
import swagger from "../swagger/swagger";
import userTypes from "../utils/userTypes";
import { checkUserAuth, requireUsers } from "../middlewares/authMiddleware";
import * as tenant from "../controllers/tenantController";
import * as user from "../controllers/userController";
import * as hrProfile from "../controllers/hrProfileController";

const router: Router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join("src", "uploads")); // Set your upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const { SAD, ADM, HRU } = userTypes;

// Swagger Docs Route
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));

// Login Routes
router.post("/login", user.userLogin);

router.use(checkUserAuth);
// Tenant Routes
router.post("/tenant/add", requireUsers([SAD]), tenant.tenantAdd);
router.get("/tenant/list", requireUsers([SAD]), tenant.getTenantList);
router.put("/tenant/update", requireUsers([SAD]), tenant.tenantUpdate);
router.get("/tenant/view/:id", requireUsers([SAD]), tenant.tenantView);
router.delete("/tenant/delete/:id", requireUsers([SAD]), tenant.tenantDelete);

// User Routes
router.post("/user/add", requireUsers([SAD, ADM]), user.userAdd);
router.get("/user/list", requireUsers([SAD, ADM]), user.getUserList);
router.put("/user/update", requireUsers([SAD, ADM]), user.userUpdate);
router.get("/user/view/:id", requireUsers([SAD, ADM]), user.userView);
router.delete("/user/delete/:id", requireUsers([SAD, ADM]), user.userDelete);

// HR Profile Routes
router.get(
  "/hrprofile/list",
  requireUsers([ADM, HRU]),
  hrProfile.getHrProfileList
);
router.post(
  "/hrprofile/photoupload",
  requireUsers([ADM, HRU]),
  upload.single("file"),
  hrProfile.hrProfilePhotoUpload
);
router.post("/hrprofile/add", requireUsers([ADM, HRU]), hrProfile.hrProfileAdd);
router.put(
  "/hrprofile/update",
  requireUsers([ADM, HRU]),
  hrProfile.hrProfileUpdate
);
router.get(
  "/hrprofile/view/:id",
  requireUsers([ADM, HRU]),
  hrProfile.hrProfileView
);
router.delete(
  "/hrprofile/delete/:id",
  requireUsers([ADM, HRU]),
  hrProfile.hrProfileDelete
);

export default router;

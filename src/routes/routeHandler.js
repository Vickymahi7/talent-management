const express = require("express");
const router = express.Router();
const swagger = require("../swagger/swagger");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: path.join("src", "uploads") });
const { checkUserAuth } = require("../middlewares/authMiddleware");
const validations = require("../validations/validations");
const userController = require("../controllers/userController");
const hrProfileController = require("../controllers/hrProfileController");

// Swagger Docs Route
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));

// Login Routes
router.post("/login", validations.userLoginValidation, userController.userLogin);
router.post("/signup", validations.userAddValidation, userController.userAdd);

router.use(checkUserAuth);
// User Routes
router.get("/user/list", userController.getUserList);
router.put("/user/update", validations.userUpdateValidation, userController.userUpdate);
router.get("/user/view/:id", userController.userView);
router.delete("/user/delete/:id", userController.userDelete);

// HR Profile Routes
router.get("/hrprofile/list", hrProfileController.getHrProfileList);
router.post("/hrprofile/photoupload", upload.single("file"), validations.photoUploadValidation, hrProfileController.hrProfilePhotoUpload);
router.post("/hrprofile/add", validations.hrProfileAddValidation, hrProfileController.hrProfileAdd);
router.put("/hrprofile/update", validations.hrProfileUpdateValidation, hrProfileController.hrProfileUpdate);
router.get("/hrprofile/view/:id", hrProfileController.hrProfileView);
router.delete("/hrprofile/delete/:id", hrProfileController.hrProfileDelete);

module.exports = router;
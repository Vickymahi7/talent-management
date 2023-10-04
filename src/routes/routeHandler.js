const express = require("express");
const router = express.Router();
const swagger = require("../configs/swaggerConfig");
const swaggerUi = require("swagger-ui-express");
const { checkUserAuth } = require("../middlewares/authMiddleware");
const hrProfileRoutes = require("./hrProfileRoutes");
const publicRoutes = require("./publicRoutes");
const userRoutes = require("./userRoutes");

router.get("/", (req, res, next) => {
  res.send("Welcome To Talent Management API");
});

// Public Routes
router.use("/api/v1/", publicRoutes);
router.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swagger));

//Protected Routes
router.use(checkUserAuth);
router.use("/api/v1/user", userRoutes);
router.use("/api/v1/hrprofile", hrProfileRoutes);

module.exports = router;

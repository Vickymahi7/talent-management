const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { userUpdateValidation } = require("../validations/validations");

router.get("/list", userController.getUserList);
router.put("/update", userUpdateValidation, userController.userUpdate);
router.get("/view/:id", userController.userView);
router.delete("/delete/:id", userController.userDelete);

module.exports = router;

const express = require("express");
const router = express.Router();
const { userLogin, userAdd } = require("../controllers/userController");
const {
  userLoginValidation,
  userAddValidation,
} = require("../validations/validations");

router.post("/login", userLoginValidation, userLogin);
router.post("/signup", userAddValidation, userAdd);

module.exports = router;

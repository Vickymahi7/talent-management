const { body } = require("express-validator");
let userList = require("../models/userList.json");

const userLoginValidation = [
  body("email_id")
    .notEmpty()
    .withMessage("Email ID is required")
    .isEmail()
    .withMessage("Invalid Email ID"),
  body("password").notEmpty().withMessage("Password is required"),
];

const userAddValidation = [
  body("user_name").notEmpty().withMessage("Username is required"),
  body("email_id")
    .notEmpty()
    .withMessage("Email ID is required")
    .isEmail()
    .withMessage("Invalid Email ID")
    .custom((value) => {
      let isUserExists =
        userList.length > 0 && userList.some((item) => item.email_id === value);
      return !isUserExists;
    })
    .withMessage("Email Id aleady exists"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const userUpdateValidation = [
  body("user_id").notEmpty().withMessage("Invalid User"),
  body("user_name").notEmpty().withMessage("Username is required"),
  body("email_id")
    .notEmpty()
    .withMessage("Email ID is required")
    .isEmail()
    .withMessage("Invalid Email ID")
    .custom((value, { req }) => {
      let isUserExists =
        userList.length > 0 &&
        userList.some(
          (item) => item.email_id === value && item.user_id != req.body.user_id
        );
      return !isUserExists;
    })
    .withMessage("Email Id aleady exists"),
];

const photoUploadValidation = [
  body("id").notEmpty().withMessage("Invalid Profile"),
  body("file").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("File is required");
    }

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error("Only image files are allowed");
    }

    return true;
  }),
];

const hrProfileAddValidation = [
  body("email_id")
    .notEmpty()
    .withMessage("Email ID is required")
    .isEmail()
    .withMessage("Invalid Email ID"),
];

const hrProfileUpdateValidation = [
  body("hr_profile_id")
    .notEmpty()
    .withMessage("Invalid Profile"),
  body("email_id")
    .notEmpty()
    .withMessage("Email ID is required")
    .isEmail()
    .withMessage("Invalid Email ID"),
];

module.exports = {
  userLoginValidation,
  userAddValidation,
  userUpdateValidation,
  photoUploadValidation,
  hrProfileAddValidation,
  hrProfileUpdateValidation
};

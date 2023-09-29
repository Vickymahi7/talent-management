const express = require('express');
const router = express.Router();
const path = require("path");
const multer = require("multer");
const upload = multer({ dest: path.join("src", "uploads") });
const hrProfileController = require('../controllers/hrProfileController');

router.get('/list', hrProfileController.getHrProfileList);
router.post('/photoupload', upload.single('file'), hrProfileController.hrProfilePhotoUpload);
router.post('/add', hrProfileController.hrProfileAdd);
router.put('/update', hrProfileController.hrProfileUpdate);
router.get('/view/:id', hrProfileController.hrProfileView);
router.delete('/delete/:id', hrProfileController.hrProfileDelete);

module.exports = router;
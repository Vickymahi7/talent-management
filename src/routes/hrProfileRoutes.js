const express = require('express');
const router = express.Router();
const hrProfileController = require('../controllers/hrProfileController');

router.get('/list', hrProfileController.getHrProfileList);
router.post('/add', hrProfileController.hrProfileAdd);
router.put('/update', hrProfileController.hrProfileUpdate);
router.get('/view/:id', hrProfileController.hrProfileView);
router.delete('/delete/:id', hrProfileController.hrProfileDelete);

module.exports = router;
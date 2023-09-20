const express = require('express');
const router = express.Router();
const workExperienceController = require('../controllers/workExperienceController');

router.get('/list', workExperienceController.getWorkExperienceList);
router.post('/add', workExperienceController.workExperienceAdd);
router.put('/update', workExperienceController.workExperienceUpdate);
router.get('/view/:id', workExperienceController.workExperienceView);
router.delete('/delete/:id', workExperienceController.workExperienceDelete);

module.exports = router;
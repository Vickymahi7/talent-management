const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');

router.get('/list', educationController.getEducationList);
router.post('/add', educationController.educationAdd);
router.put('/update', educationController.educationUpdate);
router.get('/view/:id', educationController.educationView);
router.delete('/delete/:id', educationController.educationDelete);

module.exports = router;
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/list', projectController.getProjectList);
router.post('/add', projectController.projectAdd);
router.put('/update', projectController.projectUpdate);
router.get('/view/:id', projectController.projectView);
router.delete('/delete/:id', projectController.projectDelete);

module.exports = router;
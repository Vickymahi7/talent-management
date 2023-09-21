const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/list', userController.getUserList);
// router.post('/add', userController.userAdd);
router.put('/update', userController.userUpdate);
router.get('/view/:id', userController.userView);
router.delete('/delete/:id', userController.userDelete);

module.exports = router;
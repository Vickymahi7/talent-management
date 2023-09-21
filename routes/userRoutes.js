const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkUserAuth } = require('../middlewares/authMiddleware');

router.post('/login', userController.userLogin);
router.post('/signup', userController.userAdd);

router.get('/list', checkUserAuth, userController.getUserList);
router.put('/update', checkUserAuth, userController.userUpdate);
router.get('/view/:id', checkUserAuth, userController.userView);
router.delete('/delete/:id', checkUserAuth, userController.userDelete);

module.exports = router;
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.get('/list', contactController.getContactList);
router.post('/add', contactController.contactAdd);
router.put('/update', contactController.contactUpdate);
router.get('/view/:id', contactController.contactView);
router.delete('/delete/:id', contactController.contactDelete);

module.exports = router;
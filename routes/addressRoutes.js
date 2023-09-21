const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

router.get('/list', addressController.getAddressList);
router.post('/add', addressController.addressAdd);
router.put('/update', addressController.addressUpdate);
router.get('/view/:id', addressController.addressView);
router.delete('/delete/:id', addressController.addressDelete);

module.exports = router;
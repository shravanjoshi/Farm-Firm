const express = require('express');
const adminrouter = express.Router();
const adminController = require('../controllers/adminController');
adminrouter.get('/api/admin', adminController.getAllUsers);

module.exports = adminrouter; 
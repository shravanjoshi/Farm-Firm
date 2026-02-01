
const express = require('express');
const firmrouter = express.Router();
const firmController = require('../controllers/firmController');
firmrouter.post('/api/crop-request/:cropId',firmController.PostRequestCrop);
firmrouter.get('/api/myrequests',firmController.getMyRequests);
firmrouter.post('/api/add-request',firmController.PostAddRequest);
module.exports = firmrouter;

const express = require('express');
const croprouter = express.Router();
const cropController = require('../controllers/cropController');
croprouter.get('/api/crops',cropController.getCrops);
croprouter.put('/api/crops/:cropId',cropController.updateCrop);
croprouter.get('/api/crop-details/:cropId',cropController.getCropDetails);
croprouter.get('/api/allrequests',cropController.getAllRequests);
module.exports = croprouter; 
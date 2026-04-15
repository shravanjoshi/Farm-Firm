const express = require('express');
const quotationrouter = express.Router();
const quotationController = require('../controllers/quotationController');


quotationrouter.get('/api/quotation/:requestId', quotationController.getQuotations);
quotationrouter.post('/api/quotation', quotationController.postQuotation);
quotationrouter.get('/api/my-quotations', quotationController.getFarmerQuotations);

quotationrouter.post('/api/quotation/accept/:quotationId', quotationController.acceptQuotation);
quotationrouter.post('/api/quotation/reject/:quotationId', quotationController.rejectQuotation);


module.exports = quotationrouter;

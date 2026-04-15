const mongoose = require('mongoose');
const Crop = require('../models/Crop');     // your Crop model
const Farmer = require('../models/Farmer'); // assuming logged-in user is a Farmer
const Firm = require('../models/Firm');
const Request = require('../models/Request');
const FirmRequest = require('../models/FirmRequest')
const Quotation = require('../models/Quotation');


exports.getQuotations = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const quotations = await Quotation.find({ firmRequestId: requestId }).populate('farmerId').populate('firmRequestId');

        res.status(200).json({ success: true, quotations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quotations', error });
    }
};

exports.getFarmerQuotations = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (req.user.userType !== 'farmer') {
            return res.status(403).json({ success: false, message: 'Only farmers can view this page' });
        }

        const quotations = await Quotation.find({ farmerId: req.user._id })
            .populate('farmerId', 'FirstName LastName phoneNumber')
            .populate({
                path: 'firmRequestId',
                select: 'cropname deadline requirement status createdAt firmId',
                populate: {
                    path: 'firmId',
                    select: 'CompanyName city state phoneNumber',
                },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, quotations });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching farmer quotations', error });
    }
};

exports.postQuotation = async (req, res) => {
    try {
        const { rate, farmerId, firmRequestId } = req.body;
        const quotation = new Quotation({ rate, farmerId, firmRequestId });
        await quotation.save();
        res.status(201).json({ success: true, quotation });
    } catch (error) {
        res.status(500).json({ message: 'Error creating quotation', error });
    }
};

exports.acceptQuotation = async (req, res) => {
    try {
        const quotationId = req.params.quotationId;
        const quotation = await Quotation.findById(quotationId);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        quotation.status = 'Accepted';
        await quotation.save();
        // Update the related FirmRequest status to "Accepted"
        await FirmRequest.findByIdAndUpdate(quotation.firmRequestId, { status: 'Accepted', farmerId: quotation.farmerId });
        res.status(200).json({ success: true, quotation });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting quotation', error });
    }
};

exports.rejectQuotation = async (req, res) => {
    try {
        const quotationId = req.params.quotationId;
        const quotation = await Quotation.findById(quotationId);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        quotation.status = 'Rejected';
        await quotation.save();
        res.status(200).json({ success: true, quotation });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting quotation', error });
    }
};


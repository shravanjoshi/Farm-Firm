const mongoose = require('mongoose');
const Crop = require('../models/Crop');     // your Crop model
const Farmer = require('../models/Farmer'); // assuming logged-in user is a Farmer
const FirmRequest=require('../models/FirmRequest')
exports.getCrops = async (req, res) => {
  try {
    const crops = await Crop.find().populate
    ({ path: 'userId'});
    console.log(crops);
    return res.status(200).json({
      success: true,
      crops,              // all available crops
   
    });

  } catch (error) {
    console.error('Error in getCrops:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crops',
    });
  }
};
exports.getCropDetails = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }
    const cropId = req.params.cropId;
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({ error: 'Invalid crop ID' });
    }

    // Fetch the crop document
    const cropDetail = await Crop.findById(cropId);

    if (!cropDetail) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    // Fetch the farmer (host/creator) who listed the crop
    const farmer = await Farmer.findById(cropDetail.userId);
      // Final response
    return res.status(200).json({
      success: true,
      crop: cropDetail,
      farmer: farmer || null,               // will be null if farmer deleted
      isLoggedIn: req.isLoggedIn || false,
    });

  } catch (error) {
    console.error('Error in getCropDetails:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crop details',
    });
  }
};

exports.updateCrop = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }

    const cropId = req.params.cropId;
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      return res.status(400).json({ error: 'Invalid crop ID' });
    }
    const updateData = req.body;

    // Update the crop document
    const updatedCrop = await Crop.findByIdAndUpdate(cropId, updateData);

    if (!updatedCrop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Crop updated successfully',
      crop: updatedCrop,
    });
  } catch (error) {
    console.error('Error in updateCrop:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update crop',
    });
  }
};
exports.getAllRequests = async (req, res) => {
  try {
      // 3. Fetch all requests made by this user
    const requests = await FirmRequest.find({status:"Pending"})
      .populate({
        path: 'firmId'
      })
    // 4. Format response
    return res.status(200).json({
      success: true,
       requests:requests
    });

  } catch (error) {
    console.error('Error in getAllRequests:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch your  all requests',
    });
  }
};
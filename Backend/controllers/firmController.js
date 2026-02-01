const Request = require('../models/Request');
const Crop = require('../models/Crop');
const Firm = require('../models/Firm');
const Farmer = require('../models/Farmer');
const FirmRequest=require('../models/FirmRequest');
const mongoose = require('mongoose')
const sendSMS = require('../servicesms');
// POST /api/crop-request/:cropId
exports.PostRequestCrop = async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const userId = req.user._id; // firm (from auth middleware)

    // Validate crop exists
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ error: "Crop not found" });
    }

    const { deadline, requirement } = req.body;

    if (!deadline || !requirement) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    if (new Date(deadline) < new Date()) {
      return res
        .status(400)
        .json({ error: "Deadline date must be present date or after" });
    }

    // Create new request
    const newRequest = new Request({
      deadline,
      requirement,
      cropId,
      farmerId: crop.userId, // farmer
      firmId: userId
    });

    await newRequest.save();

    // 🔔 SEND SMS TO FARMER
    const farmer = await Farmer.findById(crop.userId);

    if (farmer && farmer.phoneNumber) {
      const smsText = `
New Crop Request 📩
A firm is requesting your crop.
Crop: ${crop.cropname}
Requirement: ${requirement}
Deadline: ${new Date(deadline).toDateString()}

Please check the app for details.
      `;

      // Fire & forget (don’t block response)
      sendSMS(farmer.phoneNumber, smsText).catch(err =>
        console.error("SMS failed:", err.message)
      );
    }

    return res.status(201).json({
      success: true,
      message: "Crop request submitted successfully",
      request: newRequest
    });
  } catch (error) {
    console.error("Error creating crop request:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to submit crop request"
    });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized – please log in to view your requests'
      });
    }

    const userId = req.user._id;

    // 2. Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // 3. Fetch all requests made by this user
    const requests = await Request.find({ firmId:userId })
      .populate({
        path: 'cropId farmerId'
      })
     console.log("jkbkjhb",requests);
    // 4. Format response
    return res.status(200).json({
      success: true,
       crop:requests
    });

  } catch (error) {
    console.error('Error in getMyRequests:', error);

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch your crop requests',
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized – please log in to view your profile'
      });
    }
    const userId = req.user._id;
    // Fetch user profile details
    const firm = await Firm.findById(userId).select('-password'); // Exclude password
    if (!firm) {
      return res.status(404).json({
        success: false,
        error: 'Firm not found'
      });
    }
    return res.status(200).json({
      success: true,
      firmProfile: firm
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch firm profile',
    });
  }
};

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().select('-password').populate('listedCrops');
    return res.status(200).json({
      success: true,
      farmers
    });
  } catch (error) {
    console.error('Error in getFarmers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch farmers list',
    });
  }
};
exports.PostAddRequest = async (req, res) => {
  try {
       const userId = req.user._id; // from auth middleware
       
    // 2. Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Validate required fields (from frontend form)
    const { cropName, deadline, requirement } = req.body;
    if (!deadline || !requirement || !cropName) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Optional: You can add extra validation
    if (new Date(deadline) < new Date()) {
      return res.status(400).json({ error: 'Deadline date must be present date or after' });
    }


    // Create new request
    const newRequest = new FirmRequest({
cropname:cropName,
       deadline,
      requirement,
      firmId:userId
          });

    await newRequest.save();
 const request = await FirmRequest.findById({_id: newRequest._id})
      .populate({ 
        path: 'firmId',
      });

    return res.status(201).json({
      success: true,
      message: 'Crop request submitted successfully',
      request: request
    });

  } catch (error) {
    console.error('Error creating crop request:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit crop request'
    });
  }
};
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crop = require('../models/Crop');     // your Crop model
const Farmer = require('../models/Farmer');     // your Farmer model
const Request = require('../models/Request');     // your Farmer model
const FirmRequest=require('../models/FirmRequest');
// ────────────────────────────────────────────────
//            Multer Configuration (Local Storage)
// ────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../Uploads');
    
    // Create Uploads folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, PNG & WebP images are allowed'));
  }
});

// ────────────────────────────────────────────────
//                  Route Handler
// ────────────────────────────────────────────────

exports.PostAddCrop = [
  // Multer middleware with error handling
  (req, res, next) => {
    console.log("sjbcscb");
    upload.single('img')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Image size exceeds 5MB limit' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },

  async (req, res) => {
    try {
      // 1. Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
      }

      // 2. Validate required fields
      const { cropname, price, minquantity, totalavailable,grade } = req.body;

      if (!cropname || !price || !minquantity || !totalavailable ||!grade) {
        // Optional: delete uploaded file if validation fails
        if (req.file?.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete invalid upload:', err);
          });
        }
        return res.status(400).json({ error: 'All fields are required' });
      }

      // 3. Basic numeric validation
      const priceNum = Number(price);
      const minQty = Number(minquantity);
      const totalQty = Number(totalavailable);

      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
      if (isNaN(minQty) || minQty <= 0) {
        return res.status(400).json({ error: 'Minimum quantity must be a positive number' });
      }
      if (isNaN(totalQty) || totalQty <= 0) {
        return res.status(400).json({ error: 'Total available quantity must be a positive number' });
      }
      if (minQty > totalQty) {
        return res.status(400).json({ error: 'Minimum quantity cannot exceed total available quantity' });
      }

      // 4. Create relative path for frontend access
      // Example: /Uploads/crop-image-16987654321.jpg
      const imagePath = `/Uploads/${req.file.filename}`;

      // 5. Create new crop document
      const newCrop = new crop({
        cropname: cropname.trim(),
        price: priceNum,
        minquantity: minQty,
        totalavailable: totalQty,
        img: imagePath,           // just the path – no cloudinary object
        grade,
        userId: req.user._id,
        // Optional additional fields you might want:
        // createdAt: new Date(),
        // status: "active",
        // unit: req.body.unit || "kg",
        // quality: req.body.quality || "A",
        // description: req.body.description || "",
      });

      const savedCrop = await newCrop.save();

      // 6. Add crop to user's listed crops array
      const currentFarmer = await Farmer.findById(req.user._id);
      if (currentFarmer) {
        if (!currentFarmer.listedCrops) {
          currentFarmer.listedCrops = [];
        }
        currentFarmer.listedCrops.push(savedCrop._id);
        await currentFarmer.save();
      }

      // 7. Success response
      return res.status(201).json({
        message: 'Crop listed successfully',
        crop: savedCrop,
      });

    } catch (error) {
      console.error('Error in PostAddCrop:', error);

      // Clean up uploaded file in case of server error
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Failed to clean up file:', err);
        });
      }

      return res.status(500).json({ error: 'Failed to add crop' });
    }
  }
];
const mongoose = require('mongoose');
const Crop = require('../models/Crop');     // your Crop model
// assuming authenticated user is a Farmer

exports.getMyListedCrops = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }

    const farmerId = req.user._id;

    // 2. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }

    // 3. Find the farmer and populate their listed crops
    const currentFarmer = await Farmer.findById(farmerId)
      .populate({
        path: 'listedCrops'
      })

    if (!currentFarmer) {
      return res.status(404).json({ error: 'Farmer account not found' });
    }

    // 4. Return the response
    return res.status(200).json({
      success: true,
     listedCrops:currentFarmer.listedCrops,
      pageTitle: 'My Listed Crops',
      isLoggedIn: req.isLoggedIn,
     
    });

  } catch (error) {
    console.error('Error in getMyListedCrops:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch your listed crops',
    });
  }
};
exports.getRequestedCrops = async (req, res) => {
  try {
    // Ensure only logged-in farmer can access
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized – please log in'
      });
    }

    const farmerId = req.user._id;

    // Find all requests where the crop belongs to this farmer
    const requests = await Request.find({farmerId})
      .populate({
        path: 'cropId firmId',
      })
          return res.status(200).json({
      success: true,
      requests:requests
    });
      } catch (error) {
    console.error('Error in getRequestedCrops:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch requested crops'
    });
  }
};

exports.acceptCropRequest = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }
    const requestId = req.params.requestId;
    const farmerId = req.user._id; // assuming auth middleware sets req.user

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Crop request not found'
      });
    }


    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }

     // Update request status
    request.status = 'Accepted';
    await request.save();
    return res.status(200).json({
      success: true,
      message: 'Crop request accepted successfully',
    });
  } catch (error) {
    console.error('Error accepting crop request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while accepting request'
    });
  }
};


exports.rejectCropRequest = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }
    const requestId = req.params.requestId;
    const farmerId = req.user._id;

    const request = await Request.findById(requestId)

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Crop request not found'
      });
    }

    

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }

    // Update status
    request.status = 'Rejected';
    await request.save();
    return res.status(200).json({
      success: true,
      message: 'Crop request rejected successfully',
    });
  } catch (error) {
    console.error('Error rejecting crop request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while rejecting request'
    });
  }
};
exports.acceptFirmRequest = async (req, res) => {
  try {
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }
    const requestId = req.params.requestId;
    const farmerId = req.user._id; // assuming auth middleware sets req.user

    const request = await FirmRequest.findById(requestId);
console.log("jkdnkjsbdkjs");
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Crop request not found'
      });
    }


    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        error: `Request is already ${request.status}`
      });
    }

     // Update request status
    request.status = 'Accepted';
    await request.save();
    return res.status(200).json({
      success: true,
      message: 'Crop request accepted successfully',
    });
  } catch (error) {
    console.error('Error accepting crop request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while accepting request'
    });
  }
};
exports.getProfile = async (req, res) => {
  try {
    // 1. Authentication check
    if (!req.isLoggedIn || !req.user) {
      return res.status(401).json({ error: 'Unauthorized – please log in' });
    }
    const farmerId = req.user._id;

    // 2. Fetch farmer profile
    const farmer = await Farmer.findById(farmerId).select('-password').populate('listedCrops');
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    // 3. Return profile data
    return res.status(200).json({
      success: true,
      farmerProfile: farmer
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};
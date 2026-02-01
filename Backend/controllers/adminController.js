// GET /api/admin/all-users
const Farmer = require('../models/Farmer');
const Firm = require('../models/Firm');
exports.getAllUsers = async (req, res) => {
  try {
    const farmers = await Farmer.find({})
      .populate('listedCrops');
     

    const firms = await Firm.find({})

    res.json({ farmers, firms });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
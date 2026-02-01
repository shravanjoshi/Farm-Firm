const mongoose = require('mongoose');

const cropRequestSchema = new mongoose.Schema({
   deadline: {
    type: Date,
    required: true
  },
    requirement:{
type:Number,
required:true
    },
 farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',  // or 'User' — depending on your auth model
    required: true
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',  // or 'User' — depending on your auth model
    required: true
  },
  status:{
    type:String,
    default : "Pending"
  },
   firmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',  // or 'User' — depending on your auth model
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
 
}, {
  timestamps: true
});
module.exports = mongoose.model('Request', cropRequestSchema);
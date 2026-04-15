const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    rate:{
        type:Number,
        required:true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',  // or 'User' — depending on your auth model
        required: true
    },
    firmRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FirmRequest',  // or 'User' — depending on your auth model
        required: true
    },
    status:{
        type:String,
        default : "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
 
}, {
  timestamps: true
});
module.exports = mongoose.model('Quotation', quotationSchema);
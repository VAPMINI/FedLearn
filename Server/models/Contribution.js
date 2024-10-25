const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ContributionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  uuid: { type: String, default: uuidv4, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
});

const Contribution = mongoose.model('Contribution', ContributionSchema);
module.exports = Contribution;

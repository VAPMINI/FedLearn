const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  description: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  uuid: { type: String, default: uuidv4, unique: true },
  isPrivate: { type: Boolean, default: false },
  accuracy: { type: Number, default: 0 }
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;

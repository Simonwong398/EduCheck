const mongoose = require('mongoose');

const LearningGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  },
  learningGoals: [{
    type: String
  }],
  resources: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'PAUSED'],
    default: 'ACTIVE'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

module.exports = mongoose.model('LearningGroup', LearningGroupSchema);

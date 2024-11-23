const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true },
  points: { type: Number, default: 0 },
  rewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reward' }]
}));

const Reward = mongoose.model('Reward', new mongoose.Schema({
  name: { type: String, required: true },
  pointsRequired: { type: Number, required: true },
  description: String,
}));

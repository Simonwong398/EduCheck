const mongoose = require('mongoose');

const Achievement = mongoose.model('Achievement', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  unlocked: { type: Boolean, default: false },
  dateUnlocked: { type: Date }
}));

const mongoose = require('mongoose');

const Competition = mongoose.model('Competition', new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  results: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: Number
  }]
}));

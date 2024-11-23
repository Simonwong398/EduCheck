const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  parentID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]  // 关联学生
}, { timestamps: true });

const Parent = mongoose.model('Parent', parentSchema);

module.exports = Parent;

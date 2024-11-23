const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }]  // 关联班级
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;

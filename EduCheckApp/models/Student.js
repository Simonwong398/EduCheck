const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  grade: { type: String, required: true },
  subject: { type: String, required: true },  // 新增学科字段
  parentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Parent' }
}, { timestamps: true }); // 增加时间戳

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

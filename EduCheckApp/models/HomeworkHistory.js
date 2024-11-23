const mongoose = require('mongoose');

const homeworkHistorySchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true, default: Date.now },
  homeworkContent: { type: String, required: true },
  result: { type: String, required: true }
}, { timestamps: true }); // 自动管理创建和更新时间戳

const HomeworkHistory = mongoose.model('HomeworkHistory', homeworkHistorySchema);

module.exports = HomeworkHistory;

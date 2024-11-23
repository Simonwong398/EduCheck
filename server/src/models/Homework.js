const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  student: {
    name: {
      type: String,
      required: true
    },
    grade: String,
    class: String
  },
  subject: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  analysis: {
    correctRate: {
      type: Number,
      required: true
    },
    mistakes: [{
      question: String,
      correct: String,
      explanation: String
    }],
    suggestions: [String]
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'reviewed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// 添加索引以提高查询性能
homeworkSchema.index({ submittedBy: 1, createdAt: -1 });
homeworkSchema.index({ 'student.name': 1 });

const Homework = mongoose.model('Homework', homeworkSchema);

module.exports = Homework;

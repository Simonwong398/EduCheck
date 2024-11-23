const mongoose = require('mongoose');

const DailyTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'LEARNING', 
      'PRACTICE', 
      'CHALLENGE', 
      'SOCIAL', 
      'PERSONAL_GROWTH'
    ],
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  points: {
    type: Number,
    default: 10
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // 可以是通用任务
  },
  completedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedAt: {
    type: Date
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    default: function() {
      // 默认当天结束
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999);
      return tomorrow;
    }
  },
  requiredActions: [{
    type: String
  }],
  rewards: {
    points: {
      type: Number,
      default: 10
    },
    badges: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }]
  }
});

// 过滤已过期任务的中间件
DailyTaskSchema.pre('find', function(next) {
  const now = new Date();
  this.where('validFrom').lte(now);
  this.where('validUntil').gte(now);
  next();
});

module.exports = mongoose.model('DailyTask', DailyTaskSchema);

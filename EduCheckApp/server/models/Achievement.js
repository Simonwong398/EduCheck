const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: {
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
      'CONSISTENCY', 
      'SOCIAL', 
      'CHALLENGE', 
      'PERSONAL_GROWTH'
    ],
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  condition: {
    type: {
      type: String,
      enum: [
        'POINTS', 
        'DAYS_STREAK', 
        'SUBJECTS_LEARNED', 
        'TASKS_COMPLETED', 
        'SOCIAL_INTERACTIONS'
      ],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    }
  },
  points: {
    type: Number,
    default: 50
  },
  rarity: {
    type: String,
    enum: ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'],
    default: 'COMMON'
  },
  unlockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 静态方法：批量创建默认成就
AchievementSchema.statics.createDefaultAchievements = async function() {
  const defaultAchievements = [
    {
      name: '学习新手',
      description: '完成首个学习任务',
      category: 'LEARNING',
      condition: { type: 'POINTS', threshold: 10 },
      icon: '🌱'
    },
    {
      name: '学习者',
      description: '累计获得100积分',
      category: 'LEARNING',
      condition: { type: 'POINTS', threshold: 100 },
      icon: '📚'
    },
    {
      name: '坚持不懈',
      description: '连续学习7天',
      category: 'CONSISTENCY',
      condition: { type: 'DAYS_STREAK', threshold: 7 },
      icon: '🔥'
    },
    {
      name: '多元学习',
      description: '学习3个不同学科',
      category: 'LEARNING',
      condition: { type: 'SUBJECTS_LEARNED', threshold: 3 },
      icon: '🌈'
    }
  ];

  for (const achievementData of defaultAchievements) {
    const existingAchievement = await this.findOne({ 
      name: achievementData.name 
    });

    if (!existingAchievement) {
      await this.create(achievementData);
    }
  }
};

module.exports = mongoose.model('Achievement', AchievementSchema);

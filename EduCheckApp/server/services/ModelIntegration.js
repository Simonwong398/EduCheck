const tf = require('@tensorflow/tfjs-node');
const RecommendationEngine = require('./RecommendationEngine');
const Course = require('../models/Course');
const User = require('../models/User');

class ModelIntegration {
  constructor() {
    this.recommendationEngine = RecommendationEngine;
  }

  // 定期模型训练任务
  async scheduleModelTraining() {
    try {
      console.log('开始模型训练...');
      await this.recommendationEngine.updateRecommendationModel();
      console.log('模型训练完成');
    } catch (error) {
      console.error('模型训练失败:', error);
    }
  }

  // 生成个性化学习路径
  async generateLearningPath(userId) {
    try {
      const user = await User.findById(userId);
      const recommendedCourses = await this.recommendationEngine.recommendCourses(userId);
      
      // 根据推荐课程生成学习路径
      const learningPath = recommendedCourses.map(course => ({
        courseId: course._id,
        title: course.title,
        difficulty: course.difficulty,
        estimatedCompletionTime: this.calculateEstimatedTime(course, user)
      }));

      return learningPath;
    } catch (error) {
      console.error('生成学习路径失败:', error);
      return [];
    }
  }

  // 计算预估学习时间
  calculateEstimatedTime(course, user) {
    const baseTime = course.estimatedHours;
    const difficultyFactor = {
      1: 1.2,  // 简单
      2: 1.5,  // 中等
      3: 2.0,  // 困难
      4: 2.5,  // 高级
      5: 3.0   // 专家
    };

    const userLevelFactor = user.learningProgress < 30 ? 1.5 :
                             user.learningProgress < 60 ? 1.2 :
                             1.0;

    return Math.round(baseTime * difficultyFactor[course.difficulty] * userLevelFactor);
  }

  // 预测学习成功率
  async predictLearningSuccess(userId, courseId) {
    try {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      // 创建特征向量
      const featureVector = [
        user.learningProgress / 100,
        course.difficulty / 5,
        user.completedCourses.length,
        user.interests.includes(course.category) ? 1 : 0
      ];

      // 使用训练好的模型预测
      const tensor = tf.tensor2d([featureVector]);
      const prediction = this.recommendationEngine.model.predict(tensor);
      const successProbability = await prediction.data();

      return {
        probability: successProbability[0],
        recommendation: successProbability[0] > 0.7 ? '高度推荐' : 
                         successProbability[0] > 0.4 ? '建议尝试' : '不推荐'
      };
    } catch (error) {
      console.error('学习成功率预测失败:', error);
      return { probability: 0.5, recommendation: '无法预测' };
    }
  }

  // 异常学习行为检测
  async detectLearningAnomalies(userId) {
    try {
      const user = await User.findById(userId);
      const recentActivities = await UserActivity.find({ 
        user: userId 
      }).sort({ timestamp: -1 }).limit(30);

      const activityFeatures = recentActivities.map(activity => ({
        type: activity.type,
        duration: activity.duration,
        timestamp: activity.timestamp
      }));

      // 简单异常检测逻辑
      const anomalies = activityFeatures.filter(activity => {
        return activity.duration > user.averageStudyDuration * 2 ||
               activity.type !== user.preferredLearningStyle;
      });

      return {
        hasAnomalies: anomalies.length > 0,
        anomalies: anomalies,
        recommendation: anomalies.length > 0 
          ? '检测到学习模式异常，建议调整学习策略' 
          : '学习模式正常'
      };
    } catch (error) {
      console.error('学习异常检测失败:', error);
      return { hasAnomalies: false, anomalies: [], recommendation: '检测失败' };
    }
  }
}

module.exports = new ModelIntegration();

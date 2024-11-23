const tf = require('@tensorflow/tfjs-node');
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const UserActivity = require('../models/UserActivity');

class RecommendationEngine {
  constructor() {
    this.model = null;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      // 定义神经网络模型架构
      this.model = tf.sequential();
      
      // 输入层：用户特征、课程特征
      this.model.add(tf.layers.dense({
        inputShape: [8],  // 扩展特征维度
        units: 16,
        activation: 'relu'
      }));

      // 隐藏层
      this.model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
      }));
      
      this.model.add(tf.layers.dense({
        units: 16,
        activation: 'relu'
      }));

      // 输出层：学习成功概率
      this.model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
      }));

      // 编译模型
      this.model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      console.log('推荐模型初始化完成');
    } catch (error) {
      console.error('模型初始化失败:', error);
    }
  }

  async prepareTrainingData() {
    try {
      // 获取所有用户活动和课程数据
      const users = await User.find({});
      const courses = await Course.find({});
      const userActivities = await UserActivity.find({});

      const trainingData = [];
      const trainingLabels = [];

      for (const user of users) {
        for (const course of courses) {
          // 构建特征向量
          const featureVector = this.extractFeatures(user, course, userActivities);
          
          // 标签：是否成功完成课程
          const label = this.determineSuccessLabel(user, course);

          trainingData.push(featureVector);
          trainingLabels.push(label);
        }
      }

      return {
        features: tf.tensor2d(trainingData),
        labels: tf.tensor2d(trainingLabels, [trainingLabels.length, 1])
      };
    } catch (error) {
      console.error('训练数据准备失败:', error);
      return null;
    }
  }

  extractFeatures(user, course, userActivities) {
    const userActivitiesForCourse = userActivities.filter(
      activity => activity.user.toString() === user._id.toString() && 
                  activity.course.toString() === course._id.toString()
    );

    return [
      user.learningProgress / 100,  // 学习进度
      course.difficulty / 5,         // 课程难度
      user.completedCourses.length,  // 已完成课程数
      userActivitiesForCourse.length, // 课程相关活动数
      user.interests.includes(course.category) ? 1 : 0, // 兴趣匹配
      user.avgStudyTime,              // 平均学习时间
      course.averageCompletionRate,   // 课程平均完成率
      user.learningStyle === course.recommendedLearningStyle ? 1 : 0 // 学习风格匹配
    ];
  }

  determineSuccessLabel(user, course) {
    const completedCourse = user.completedCourses.includes(course._id);
    return completedCourse ? [1] : [0];
  }

  async trainModel() {
    try {
      console.log('开始模型训练...');
      const trainingData = await this.prepareTrainingData();
      
      if (!trainingData) {
        throw new Error('训练数据准备失败');
      }

      const { features, labels } = trainingData;

      // 模型训练配置
      const history = await this.model.fit(features, labels, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs.loss}, accuracy = ${logs.acc}`);
          }
        }
      });

      console.log('模型训练完成');
      return history;
    } catch (error) {
      console.error('模型训练失败:', error);
    } finally {
      // 释放张量资源
      tf.dispose(features);
      tf.dispose(labels);
    }
  }

  async recommendCourses(userId) {
    try {
      const user = await User.findById(userId);
      const courses = await Course.find({});

      const recommendations = await Promise.all(
        courses.map(async course => {
          const featureVector = this.extractFeatures(user, course, 
            await UserActivity.find({ user: userId }));
          
          const tensor = tf.tensor2d([featureVector]);
          const prediction = this.model.predict(tensor);
          const probability = await prediction.data();

          return {
            course,
            recommendationScore: probability[0]
          };
        })
      );

      // 根据推荐分数排序
      return recommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 5)  // 返回top 5推荐课程
        .map(rec => rec.course);
    } catch (error) {
      console.error('课程推荐失败:', error);
      return [];
    }
  }

  // 定期模型更新
  async scheduleModelUpdate() {
    try {
      // 每周一次模型重训练
      await this.trainModel();
      
      // 保存模型
      await this.model.save('file:///model/recommendation_model');
      
      console.log('模型已更新并保存');
    } catch (error) {
      console.error('模型更新失败:', error);
    }
  }
}

module.exports = new RecommendationEngine();

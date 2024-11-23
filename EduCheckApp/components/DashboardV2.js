import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

// 懒加载组件
const AchievementSystem = lazy(() => import('./AchievementSystem'));
const SocialInteraction = lazy(() => import('./SocialInteraction'));
const RecommendedCourses = lazy(() => import('./RecommendedCourses'));

function DashboardV2() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    learningProgress: 0,
    totalPoints: 0,
    completedTasks: 0,
    unlockedAchievements: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/dashboard/summary');
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError('仪表盘数据加载失败');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div>{error}</div>;

  return (
    <ErrorBoundary fallback={<div>发生未知错误</div>}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="dashboard-container"
      >
        <div className="dashboard-header">
          <h1>欢迎回来, {user.username}!</h1>
          <div className="quick-stats">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <h3>学习进度</h3>
              <div className="progress-bar">
                <div 
                  style={{ 
                    width: `${dashboardData.learningProgress}%`,
                    backgroundColor: dashboardData.learningProgress > 50 ? '#4CAF50' : '#FF9800'
                  }}
                ></div>
              </div>
              <p>{dashboardData.learningProgress}%</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <h3>总积分</h3>
              <p>{dashboardData.totalPoints}</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <h3>已完成任务</h3>
              <p>{dashboardData.completedTasks}</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="stat-card"
            >
              <h3>解锁成就</h3>
              <p>{dashboardData.unlockedAchievements}</p>
            </motion.div>
          </div>
        </div>

        <div className="dashboard-content">
          <Suspense fallback={<LoadingSpinner />}>
            <div className="dashboard-section">
              <h2>个人成就</h2>
              <AchievementSystem />
            </div>

            <div className="dashboard-section">
              <h2>社交学习</h2>
              <SocialInteraction />
            </div>

            <div className="dashboard-section">
              <h2>推荐课程</h2>
              <RecommendedCourses />
            </div>
          </Suspense>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}

export default DashboardV2;

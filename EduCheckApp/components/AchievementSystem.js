import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import ErrorMessage from './ErrorMessage';

// 成就类型定义
const ACHIEVEMENT_TYPES = {
  LEARNING: {
    category: '学习',
    levels: [
      { name: '初学者', minPoints: 0, maxPoints: 100, icon: '🌱' },
      { name: '学习者', minPoints: 101, maxPoints: 500, icon: '📚' },
      { name: '专家', minPoints: 501, maxPoints: 1000, icon: '🏆' },
      { name: '大师', minPoints: 1001, maxPoints: Infinity, icon: '🌟' }
    ]
  },
  CONSISTENCY: {
    category: '坚持',
    levels: [
      { name: '新手', minDays: 0, maxDays: 7, icon: '🌞' },
      { name: '常青树', minDays: 8, maxDays: 30, icon: '🌳' },
      { name: '铁杆学习者', minDays: 31, maxDays: 90, icon: '💪' },
      { name: '学习传奇', minDays: 91, maxDays: Infinity, icon: '🔥' }
    ]
  },
  DIVERSITY: {
    category: '多元',
    levels: [
      { name: '探索者', minSubjects: 0, maxSubjects: 2, icon: '🧭' },
      { name: '全面发展', minSubjects: 3, maxSubjects: 5, icon: '🌈' },
      { name: '通才', minSubjects: 6, maxSubjects: 8, icon: '🌍' },
      { name: '万能学霸', minSubjects: 9, maxSubjects: Infinity, icon: '🚀' }
    ]
  }
};

function AchievementSystem() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState({
    totalPoints: 0,
    learningDays: 0,
    subjectsDiversity: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievementData = async () => {
      try {
        const [achievementsResponse, progressResponse] = await Promise.all([
          axios.get('/achievements/all'),
          axios.get('/achievements/user-progress')
        ]);

        setAchievements(achievementsResponse.data);
        setUserProgress(progressResponse.data);
      } catch (err) {
        setError('无法加载成就系统');
      }
    };

    fetchAchievementData();
  }, []);

  const renderAchievementCategory = (category) => {
    const categoryData = ACHIEVEMENT_TYPES[category];
    const userProgressKey = {
      'LEARNING': 'totalPoints',
      'CONSISTENCY': 'learningDays',
      'DIVERSITY': 'subjectsDiversity'
    }[category];

    return (
      <div key={category}>
        <h3>{categoryData.category}成就</h3>
        {categoryData.levels.map((level, index) => {
          const isUnlocked = userProgress[userProgressKey] >= level.minPoints;
          
          return (
            <div 
              key={index} 
              style={{ 
                opacity: isUnlocked ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                margin: '10px 0'
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '10px' }}>
                {level.icon}
              </span>
              <div>
                <strong>{level.name}</strong>
                <p>
                  {category === 'LEARNING' && `积分 ${level.minPoints}+`}
                  {category === 'CONSISTENCY' && `连续学习 ${level.minDays}+ 天`}
                  {category === 'DIVERSITY' && `学习 ${level.minSubjects}+ 个学科`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecentAchievements = () => {
    return (
      <div>
        <h3>最近解锁成就</h3>
        {achievements.filter(a => a.isNew).map(achievement => (
          <div key={achievement._id}>
            <span>{achievement.icon}</span>
            <span>{achievement.name}</span>
            <span>{new Date(achievement.unlockedAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <h2>成就系统</h2>
      <div>
        <h3>个人进度</h3>
        <p>总积分: {userProgress.totalPoints}</p>
        <p>连续学习天数: {userProgress.learningDays}</p>
        <p>学习学科数: {userProgress.subjectsDiversity}</p>
      </div>

      {Object.keys(ACHIEVEMENT_TYPES).map(renderAchievementCategory)}
      {renderRecentAchievements()}
    </div>
  );
}

export default AchievementSystem;

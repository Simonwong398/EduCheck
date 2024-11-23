import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import ErrorMessage from './ErrorMessage';

const DAILY_TASKS = [
  { id: 1, name: '完成一节在线课程', points: 20, category: '学习' },
  { id: 2, name: '解答3道练习题', points: 15, category: '练习' },
  { id: 3, name: '观看教育视频', points: 10, category: '视频' },
  { id: 4, name: '参与讨论区', points: 25, category: '互动' },
  { id: 5, name: '阅读推荐文章', points: 15, category: '阅读' }
];

const ACHIEVEMENTS = [
  { 
    id: 1, 
    name: '学习新手', 
    description: '完成首个在线课程', 
    points: 50,
    icon: '🌱'
  },
  { 
    id: 2, 
    name: '知识猎人', 
    description: '连续7天学习', 
    points: 100,
    icon: '🔍'
  },
  { 
    id: 3, 
    name: '多面学习者', 
    description: '跨3个不同学科', 
    points: 200,
    icon: '🌈'
  }
];

function Gamification() {
  const { user } = useAuth();
  const [dailyTasks, setDailyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [error, setError] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchGamificationData = async () => {
      try {
        const [tasksResponse, achievementsResponse] = await Promise.all([
          axios.get('/gamification/daily-tasks'),
          axios.get('/gamification/achievements')
        ]);

        setDailyTasks(tasksResponse.data.dailyTasks || DAILY_TASKS);
        setCompletedTasks(tasksResponse.data.completedTasks || []);
        setAvailableAchievements(achievementsResponse.data.availableAchievements || ACHIEVEMENTS);
        setUserAchievements(achievementsResponse.data.userAchievements || []);
        setTotalPoints(tasksResponse.data.totalPoints || 0);
      } catch (err) {
        setError('无法加载游戏化数据');
      }
    };

    fetchGamificationData();
  }, []);

  const completeTask = async (taskId) => {
    try {
      const response = await axios.post('/gamification/complete-task', { taskId });
      
      const completedTask = dailyTasks.find(task => task.id === taskId);
      setCompletedTasks([...completedTasks, completedTask]);
      setTotalPoints(response.data.totalPoints);
      
      // 检查是否解锁新成就
      checkAchievements();
    } catch (err) {
      setError('任务完成失败');
    }
  };

  const checkAchievements = async () => {
    try {
      const response = await axios.get('/gamification/check-achievements');
      
      const newAchievements = response.data.unlockedAchievements;
      if (newAchievements && newAchievements.length > 0) {
        setUserAchievements([...userAchievements, ...newAchievements]);
      }
    } catch (err) {
      console.error('检查成就失败', err);
    }
  };

  const renderDailyTasks = () => {
    return (
      <div>
        <h3>每日任务</h3>
        {dailyTasks.map(task => (
          <div key={task.id}>
            <span>{task.name}</span>
            <span>+{task.points}分</span>
            <button 
              onClick={() => completeTask(task.id)}
              disabled={completedTasks.some(t => t.id === task.id)}
            >
              {completedTasks.some(t => t.id === task.id) ? '已完成' : '完成'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderAchievements = () => {
    return (
      <div>
        <h3>成就系统</h3>
        {availableAchievements.map(achievement => (
          <div 
            key={achievement.id} 
            style={{ 
              opacity: userAchievements.some(a => a.id === achievement.id) ? 1 : 0.5 
            }}
          >
            <span>{achievement.icon}</span>
            <span>{achievement.name}</span>
            <span>{achievement.description}</span>
            <span>+{achievement.points}分</span>
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
      <h2>游戏化学习</h2>
      <div>
        <h3>个人统计</h3>
        <p>总积分: {totalPoints}</p>
      </div>

      {renderDailyTasks()}
      {renderAchievements()}
    </div>
  );
}

export default Gamification;

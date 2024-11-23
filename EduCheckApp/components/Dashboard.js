import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axiosConfig';
import ErrorMessage from './ErrorMessage';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

function Dashboard() {
  const { user } = useAuth();
  const [learningStats, setLearningStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, achievementsResponse, competitionsResponse] = await Promise.all([
          axios.get('/dashboard/learning-stats'),
          axios.get('/achievements'),
          axios.get('/competitions')
        ]);

        setLearningStats(statsResponse.data);
        setAchievements(achievementsResponse.data);
        setCompetitions(competitionsResponse.data);
      } catch (err) {
        setError('无法加载仪表盘数据');
      }
    };

    fetchDashboardData();
  }, []);

  const renderLearningProgressChart = () => {
    if (!learningStats?.progressData) return null;

    return (
      <div>
        <h3>学习进度</h3>
        <LineChart width={600} height={300} data={learningStats.progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="progress" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </div>
    );
  };

  const renderAchievements = () => {
    return (
      <div>
        <h3>最近成就</h3>
        {achievements.map(achievement => (
          <div key={achievement._id}>
            <span>{achievement.name}</span>
            <span>{new Date(achievement.unlockedAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCompetitions = () => {
    return (
      <div>
        <h3>参与的竞赛</h3>
        {competitions.map(competition => (
          <div key={competition._id}>
            <span>{competition.name}</span>
            <span>状态：{competition.status}</span>
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
      <h2>欢迎回来, {user?.username}!</h2>
      
      <div>
        <h3>个人统计</h3>
        <p>总积分: {learningStats?.totalPoints || 0}</p>
        <p>完成任务: {learningStats?.completedTasks || 0}</p>
      </div>

      {renderLearningProgressChart()}
      {renderAchievements()}
      {renderCompetitions()}
    </div>
  );
}

export default Dashboard;

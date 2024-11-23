import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Achievements({ userId }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}/achievements`);
        setAchievements(response.data);
      } catch (error) {
        console.error('获取成就数据失败', error);
      }
    };
    fetchAchievements();
  }, [userId]);

  return (
    <div>
      <h3>已解锁成就:</h3>
      <ul>
        {achievements.map(ach => (
          <li key={ach._id}>
            {ach.type} - {ach.unlocked ? '已解锁' : '未解锁'}
            {ach.unlocked && <span> (解锁时间: {new Date(ach.dateUnlocked).toLocaleDateString()})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Achievements;

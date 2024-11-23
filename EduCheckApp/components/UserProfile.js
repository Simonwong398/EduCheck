import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfile({ userId }) {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}`);
        setPoints(response.data.points);
        setRewards(response.data.rewards);
      } catch (error) {
        console.error('获取用户数据失败', error);
      }
    };
    fetchUserData();
  }, [userId]);

  return (
    <div>
      <h2>当前积分: {points}</h2>
      <h3>可兑换奖励:</h3>
      <ul>
        {rewards.map(reward => (
          <li key={reward._id}>{reward.name} - {reward.pointsRequired}积分</li>
        ))}
      </ul>
    </div>
  );
}

export default UserProfile;

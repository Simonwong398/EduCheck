import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Competitions({ userId }) {
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await axios.get('/api/competitions');
        setCompetitions(response.data);
      } catch (error) {
        console.error('获取竞赛数据失败', error);
      }
    };
    fetchCompetitions();
  }, []);

  const joinCompetition = async (competitionId) => {
    try {
      await axios.post('/api/join-competition', { userId, competitionId });
      alert('已加入竞赛');
    } catch (error) {
      console.error('加入竞赛失败', error);
    }
  };

  return (
    <div>
      <h2>当前竞赛</h2>
      <ul>
        {competitions.map(comp => (
          <li key={comp._id}>
            {comp.name} - {new Date(comp.startDate).toLocaleDateString()} 至 {new Date(comp.endDate).toLocaleDateString()}
            <button onClick={() => joinCompetition(comp._id)}>加入竞赛</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Competitions;
